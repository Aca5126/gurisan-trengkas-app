// plugins/visual-edits/babel-metadata-plugin.js
// Babel plugin to wrap/stamp JSX elements with metadata for visual editing

const path = require("path");
const t = require("@babel/types");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");

const ARRAY_METHODS = new Set(["map", "filter", "reduce", "flatMap"]);
const RADIX_ROOTS = new Set([
  "Popover",
  "PopoverContent",
  "PopoverPortal",
  "Tooltip",
  "TooltipContent",
  "TooltipPortal",
  "DropdownMenu",
  "DropdownMenuContent",
  "DropdownMenuSubContent",
  "DropdownMenuPortal",
  "ContextMenu",
  "ContextMenuContent",
  "ContextMenuSubContent",
  "ContextMenuPortal",
  "HoverCard",
  "HoverCardContent",
  "Menubar",
  "MenubarContent",
  "MenubarSubContent",
  "MenubarPortal",
  "NavigationMenu",
  "NavigationMenuContent",
  "Sheet",
  "SheetContent",
  "SheetOverlay",
  "SheetPortal",
  "Drawer",
  "DrawerContent",
  "DrawerOverlay",
  "DrawerPortal",
  "Toast",
  "ToastViewport",
  "Select",
  "SelectContent",
  "Command",
  "CommandDialog",
  "Slot",
]);

const DYNAMIC_COMP_CACHE = new Map();
const BINDING_DYNAMIC_CACHE = new Map();

const fileNameCache = new Map();
const processedNodes = new WeakSet();

// Helper: get element/component name
function getName(openingEl) {
  if (!openingEl || !openingEl.name) return null;
  const name = openingEl.name;
  if (t.isJSXIdentifier(name)) return name.name;
  if (t.isJSXMemberExpression(name)) {
    // e.g., Icons.ChevronRight
    const parts = [];
    let cur = name;
    while (t.isJSXMemberExpression(cur)) {
      parts.unshift(cur.property.name);
      cur = cur.object;
    }
    if (t.isJSXIdentifier(cur)) parts.unshift(cur.name);
    return parts.join(".");
  }
  return null;
}

// Helper: check prop existence
function hasProp(openingEl, propName) {
  if (!openingEl || !openingEl.attributes) return false;
  return openingEl.attributes.some(
    (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === propName
  );
}

// Helper: insert meta attributes to existing opening element
function insertMetaAttributes(openingEl, attrs) {
  openingEl.attributes = openingEl.attributes || [];
  openingEl.attributes.push(...attrs);
}

// Helper: push metadata attributes with optional exclusion mark
function pushMetaAttrs(openingEl, { normalizedPath, lineNumber, elementName, isDynamic }, { markExcluded = false } = {}) {
  const attrs = [
    t.jsxAttribute(t.jsxIdentifier("x-file-name"), t.stringLiteral(normalizedPath)),
    t.jsxAttribute(t.jsxIdentifier("x-line-number"), t.stringLiteral(String(lineNumber))),
    t.jsxAttribute(t.jsxIdentifier("x-component"), t.stringLiteral(elementName)),
    t.jsxAttribute(t.jsxIdentifier("x-id"), t.stringLiteral(`${normalizedPath}_${lineNumber}`)),
    t.jsxAttribute(t.jsxIdentifier("x-dynamic"), t.stringLiteral(isDynamic ? "true" : "false")),
  ];
  if (markExcluded) {
    attrs.push(t.jsxAttribute(t.jsxIdentifier("x-excluded"), t.stringLiteral("true")));
  }
  insertMetaAttributes(openingEl, attrs);
}

// Helper: portal primitives
function isPortalPrimitive(name) {
  return RADIX_ROOTS.has(name);
}

// Helper: check direct child of asChild or trigger-like component names
function isDirectChildOfAsChildOrTrigger(jsxPath) {
  const p = jsxPath.parentPath;
  if (!p || !p.isJSXElement || !p.isJSXElement()) return false;
  const parentOpen = p.node.openingElement;
  const parentName = getName(parentOpen) || "";
  const triggerNames = new Set([
    "PopoverTrigger",
    "TooltipTrigger",
    "DropdownMenuTrigger",
    "ContextMenuTrigger",
    "HoverCardTrigger",
    "SelectTrigger",
    "MenubarTrigger",
    "NavigationMenuTrigger",
    "SheetTrigger",
    "DrawerTrigger",
  ]);
  const parentHasAsChild = hasProp(parentOpen, "asChild");
  return parentHasAsChild || triggerNames.has(parentName);
}

// Helper: detect composite portals (e.g., DemoPopover rendering inner primitives)
function usageIsCompositePortal({ elementName, jsxPath, state, t, traverse, parser, RADIX_ROOTS }) {
  // Heuristic: if elementName ends with names like *Popover, *Tooltip, treat as composite portal
  const suffixes = ["Popover", "Tooltip", "DropdownMenu", "ContextMenu", "HoverCard", "Menubar", "NavigationMenu", "Sheet", "Drawer", "Toast", "Select", "Command"];
  if (RADIX_ROOTS.has(elementName)) return true;
  return suffixes.some(suf => elementName.endsWith(suf));
}

// Resolve import path relative to a file
function resolveImportPath(spec, fromFileAbs) {
  if (!spec) return null;
  if (spec.startsWith(".") || spec.startsWith("/")) {
    const baseDir = path.dirname(fromFileAbs);
    const candidate = path.resolve(baseDir, spec);
    const exts = ["", ".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.tsx"];
    for (const ext of exts) {
      const p = candidate + ext;
      if (fs.existsSync(p)) return p;
    }
    return candidate;
  }
  // For bare imports, attempt node_modules resolution fallback (not strict)
  try {
    return require.resolve(spec, { paths: [path.dirname(fromFileAbs)] });
  } catch {
    return null;
  }
}

// Parse file AST
function parseFileAst(absPath, parserLib) {
  try {
    const src = fs.readFileSync(absPath, "utf8");
    return parserLib.parse(src, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch {
    return null;
  }
}

// Check if a JSX element is inside an array iteration callback
function isJSXDynamic(jsxPath) {
  let currentPath = jsxPath.parentPath;
  while (currentPath) {
    if (currentPath.isCallExpression()) {
      const { callee } = currentPath.node;
      if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
        if (ARRAY_METHODS.has(callee.property.name)) return true;
      }
    }
    currentPath = currentPath.parentPath;
  }
  return false;
}

// Check if JSX element has any expressions (data dependencies)
function hasAnyExpression(jsxElement) {
  const openingEl = jsxElement.openingElement;
  if (openingEl?.attributes?.some((attr) => t.isJSXSpreadAttribute(attr))) {
    return true;
  }
  for (const child of jsxElement.children) {
    if (
      t.isJSXExpressionContainer(child) &&
      !t.isJSXEmptyExpression(child.expression)
    ) {
      return true;
    }
    if (t.isJSXSpreadChild(child)) {
      return true;
    }
  }
  return false;
}

function pathHasDynamicJSX(targetPath) {
  if (!targetPath || !targetPath.node) return false;
  let dynamic = false;
  targetPath.traverse({
    JSXExpressionContainer(p) {
      if (dynamic) return;
      if (!t.isJSXEmptyExpression(p.node.expression)) {
        dynamic = true;
        p.stop();
      }
    },
    JSXSpreadAttribute(p) {
      if (dynamic) return;
      dynamic = true;
      p.stop();
    },
    JSXSpreadChild(p) {
      if (dynamic) return;
      dynamic = true;
      p.stop();
    },
  });
  return dynamic;
}

function pathIsDynamicComponent(path, visited = new WeakSet()) {
  if (!path || !path.node) return false;
  if (visited.has(path.node)) return false;
  visited.add(path.node);

  if (
    path.isFunctionDeclaration() ||
    path.isFunctionExpression() ||
    path.isArrowFunctionExpression()
  ) {
    return pathHasDynamicJSX(path);
  }

  if (path.isVariableDeclarator()) {
    const init = path.get("init");
    return init && init.node ? pathIsDynamicComponent(init, visited) : false;
  }

  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (binding) {
      return pathIsDynamicComponent(binding.path, visited);
    }
    return false;
  }

  if (path.isCallExpression()) {
    const args = path.get("arguments") || [];
    if (args.length === 0) {
      return true;
    }
    for (const arg of args) {
      if (pathIsDynamicComponent(arg, visited)) {
        return true;
      }
    }
    return false;
  }

  if (path.isReturnStatement()) {
    const argument = path.get("argument");
    return argument && argument.node
      ? pathIsDynamicComponent(argument, visited)
      : false;
  }

  if (path.isExpressionStatement()) {
    const expr = path.get("expression");
    return expr && expr.node ? pathIsDynamicComponent(expr, visited) : false;
  }

  if (path.isJSXElement() || path.isJSXFragment()) {
    return pathHasDynamicJSX(path);
  }

  if (path.isObjectExpression()) {
    return true;
  }

  return false;
}

function fileExportIsDynamic({ absPath, exportName }) {
  if (!absPath) return false;
  const cacheKey = `${absPath}::${exportName}`;
  if (DYNAMIC_COMP_CACHE.has(cacheKey)) {
    return DYNAMIC_COMP_CACHE.get(cacheKey);
  }

  const ast = parseFileAst(absPath, parser);
  if (!ast) {
    DYNAMIC_COMP_CACHE.set(cacheKey, false);
    return false;
  }

  let dynamic = false;
  const visited = new WeakSet();

  function evaluatePath(nodePath) {
    if (!nodePath || !nodePath.node || dynamic) return;
    if (visited.has(nodePath.node)) return;
    visited.add(nodePath.node);

    if (
      nodePath.isFunctionDeclaration() ||
      nodePath.isFunctionExpression() ||
      nodePath.isArrowFunctionExpression()
    ) {
      if (pathHasDynamicJSX(nodePath)) {
        dynamic = true;
      }
      return;
    }

    if (nodePath.isVariableDeclarator()) {
      evaluatePath(nodePath.get("init"));
      return;
    }

    if (nodePath.isIdentifier()) {
      const binding = nodePath.scope.getBinding(nodePath.node.name);
      if (binding) {
        evaluatePath(binding.path);
      }
      return;
    }

    if (nodePath.isCallExpression()) {
      const args = nodePath.get("arguments") || [];
      if (args.length === 0) {
        dynamic = true;
        return;
      }
      for (const arg of args) {
        evaluatePath(arg);
        if (dynamic) return;
      }
      return;
    }

    if (nodePath.isReturnStatement()) {
      evaluatePath(nodePath.get("argument"));
      return;
    }

    if (nodePath.isExpressionStatement()) {
      evaluatePath(nodePath.get("expression"));
      return;
    }

    if (nodePath.isJSXElement() || nodePath.isJSXFragment()) {
      if (pathHasDynamicJSX(nodePath)) {
        dynamic = true;
      }
      return;
    }

    if (nodePath.isObjectExpression()) {
      dynamic = true;
    }
  }

  traverse(ast, {
    ExportDefaultDeclaration(p) {
      if (dynamic || exportName !== "default") return;
      evaluatePath(p.get("declaration"));
    },
    ExportNamedDeclaration(p) {
      if (dynamic || exportName === "default") return;

      if (p.node.declaration) {
        const decl = p.node.declaration;
        if (t.isFunctionDeclaration(decl) && decl.id?.name === exportName) {
          evaluatePath(p.get("declaration"));
          return;
        }
        if (t.isVariableDeclaration(decl)) {
          decl.declarations.forEach((vd, i) => {
            if (t.isIdentifier(vd.id) && vd.id.name === exportName) {
              evaluatePath(p.get(`declaration.declarations.${i}`));
            }
          });
          return;
        }
      }

      p.node.specifiers.forEach((s) => {
        if (
          !t.isExportSpecifier(s) ||
          !t.isIdentifier(s.exported) ||
          s.exported.name !== exportName
        ) {
          return;
        }

        if (p.node.source) {
          const from = p.node.source.value;
          const resolved = resolveImportPath(from, absPath);
          if (resolved) {
            if (
              fileExportIsDynamic({
                absPath: resolved,
                exportName: t.isIdentifier(s.local)
                  ? s.local.name
                  : exportName,
              })
            ) {
              dynamic = true;
            }
          }
          return;
        }

        if (t.isIdentifier(s.local)) {
          const binding = p.scope.getBinding(s.local.name);
          if (binding) {
            evaluatePath(binding.path);
          }
        }
      });
    },
  });

  DYNAMIC_COMP_CACHE.set(cacheKey, dynamic);
  return dynamic;
}

function componentBindingIsDynamic({ binding, state }) {
  if (!binding || !binding.path) return false;
  const bindingPath = binding.path;

  if (BINDING_DYNAMIC_CACHE.has(bindingPath.node)) {
    return BINDING_DYNAMIC_CACHE.get(bindingPath.node);
  }

  let result = false;

  if (bindingPath.isImportSpecifier()) {
    const from = bindingPath.parent.source.value;
    const fileFrom =
      state.filename ||
      state.file?.opts?.filename ||
      state.file?.sourceFileName ||
      __filename;
    const absPath = resolveImportPath(from, fileFrom);
    const exportName = bindingPath.node.imported.name;
    result = !!absPath ? fileExportIsDynamic({ absPath, exportName }) : false;
    BINDING_DYNAMIC_CACHE.set(bindingPath.node, result);
    return result;
  }

  if (bindingPath.isImportDefaultSpecifier()) {
    const from = bindingPath.parent.source.value;
    const fileFrom =
      state.filename ||
      state.file?.opts?.filename ||
      state.file?.sourceFileName ||
      __filename;
    const absPath = resolveImportPath(from, fileFrom);
    result = !!absPath
      ? fileExportIsDynamic({ absPath, exportName: "default" })
      : false;
    BINDING_DYNAMIC_CACHE.set(bindingPath.node, result);
    return result;
  }

  if (bindingPath.isImportNamespaceSpecifier()) {
    BINDING_DYNAMIC_CACHE.set(bindingPath.node, false);
    return false;
  }

  result = pathIsDynamicComponent(bindingPath);
  BINDING_DYNAMIC_CACHE.set(bindingPath.node, result);
  return result;
}

function babelMetadataPlugin() {
  return {
    name: "element-metadata-plugin",
    visitor: {
      // Wrap React components (capitalized JSX) with metadata divs,
      // or stamp attributes when wrapping would break Radix/Floating-UI.
      JSXElement(jsxPath, state) {
        if (processedNodes.has(jsxPath.node)) return;

        const openingElement = jsxPath.node.openingElement;
        if (!openingElement?.name) return;
        const elementName = getName(openingElement);
        if (!elementName) return;

        // Only process capitalized components (React components)
        if (!/^[A-Z]/.test(elementName)) return;

        // Exclude components that have strict child requirements or break when wrapped
        const excludedComponents = new Set([
          "Route",
          "Routes",
          "Switch",
          "Redirect",
          "Navigate", // React Router
          "Fragment",
          "Suspense",
          "StrictMode", // React built-ins
          "ErrorBoundary",
          "Provider",
          "Consumer",
          "Outlet",
          "Link",
          "NavLink",
          // Portal-based primitives/triggers (Radix/Floating-UI)
          "Sheet",
          "SheetContent",
          "SheetOverlay",
          "SheetPortal",
          "Popover",
          "PopoverContent",
          "Tooltip",
          "TooltipContent",
          "DropdownMenu",
          "DropdownMenuContent",
          "DropdownMenuSubContent",
          "ContextMenu",
          "ContextMenuContent",
          "ContextMenuSubContent",
          "HoverCard",
          "HoverCardContent",
          "Select",
          "SelectContent",
          "Menubar",
          "MenubarContent",
          "MenubarSubContent",
          "MenubarPortal",
          "Drawer",
          "DrawerContent",
          "DrawerOverlay",
          "DrawerPortal",
          "Toast",
          "ToastViewport",
          "NavigationMenu",
          "NavigationMenuContent",
          "DropdownMenuPortal",
          "ContextMenuPortal",
          "Command",
          "CommandDialog",
          // Triggers & measured bits
          "PopoverTrigger",
          "TooltipTrigger",
          "DropdownMenuTrigger",
          "ContextMenuTrigger",
          "HoverCardTrigger",
          "SelectTrigger",
          "MenubarTrigger",
          "NavigationMenuTrigger",
          "SheetTrigger",
          "DrawerTrigger",
          "CommandInput",
          "Slot",
          // icons (avoid wrapping)
          "X",
          "ChevronRight",
          "ChevronLeft",
          "ChevronUp",
          "ChevronDown",
          "Check",
          "Plus",
          "Minus",
          "Search",
          "Menu",
          "Settings",
          "User",
          "Home",
          "ArrowRight",
          "ArrowLeft",
        ]);
        if (excludedComponents.has(elementName)) return;

        // Check if parent is a component that strictly validates children
        const parent = jsxPath.parentPath;
        if (parent?.isJSXElement?.()) {
          const parentName = getName(parent.node.openingElement) || "";
          if (
            [
              "Routes",
              "Switch",
              "BrowserRouter",
              "Router",
              "MemoryRouter",
              "HashRouter",
            ].includes(parentName) ||
            RADIX_ROOTS.has(parentName)
          ) {
            // Don't wrap if direct child of strict parent (e.g., Route inside Routes, or Radix roots)
            return;
          }
        }

        // Get source location
        const filename =
          state.filename ||
          state.file?.opts?.filename ||
          state.file?.sourceFileName ||
          "unknown";
        const lineNumber = openingElement.loc?.start.line || 0;

        if (!fileNameCache.has(filename)) {
          const base = path.basename(filename).replace(/\.[jt]sx?$/, "");
          fileNameCache.set(filename, base);
        }
        const normalizedPath = fileNameCache.get(filename) || "unknown";

        // Detect dynamic
        let isDynamic = isJSXDynamic(jsxPath) || hasAnyExpression(jsxPath.node);

        if (!isDynamic) {
          const binding = jsxPath.scope.getBinding(elementName);
          if (binding) {
            isDynamic = componentBindingIsDynamic({ binding, state });
          }
        }

        // Check if parent is a detected composite portal
        const parentIsCompositePortal = (() => {
          const p = jsxPath.parentPath;
          if (!p || !p.isJSXElement || !p.isJSXElement()) return false;
          const parentName = getName(p.node.openingElement);
          if (!parentName || !/^[A-Z]/.test(parentName)) return false;

          // Check if parent was detected as composite portal
          return usageIsCompositePortal({
            elementName: parentName,
            jsxPath: p,
            state,
            t,
            traverse,
            parser,
            RADIX_ROOTS,
          });
        })();

        // 🚫 If this element is a direct child of a Trigger/asChild/Slot,
        // or itself a primitive/root, DO NOT WRAP — stamp x-* on the element itself
        // and mark it with x-excluded="true".
        if (
          hasProp(openingElement, "asChild") ||
          isPortalPrimitive(elementName) ||
          RADIX_ROOTS.has(elementName) ||
          isDirectChildOfAsChildOrTrigger(jsxPath) ||
          parentIsCompositePortal
        ) {
          pushMetaAttrs(
            openingElement,
            { normalizedPath, lineNumber, elementName, isDynamic },
            { markExcluded: true },
          );
          return;
        }

        // NEW: dynamic composite detection (e.g., DemoPopover renders Popover primitives)
        const compositePortal = usageIsCompositePortal({
          elementName,
          jsxPath,
          state,
          t,
          traverse,
          parser,
          RADIX_ROOTS,
        });

        if (compositePortal) {
          // Treat like a primitive/root: don't wrap; stamp + mark excluded
          pushMetaAttrs(
            openingElement,
            { normalizedPath, lineNumber, elementName, isDynamic },
            { markExcluded: true },
          );
          return;
        }

        // ✅ Normal case: wrap with display: contents and preserve an existing key
        processedNodes.add(jsxPath.node);

        const keyAttr = openingElement.attributes?.find(
          (a) =>
            t.isJSXAttribute(a) &&
            t.isJSXIdentifier(a.name) &&
            a.name.name === "key",
        );

        const wrapperAttrs = [
          t.jsxAttribute(
            t.jsxIdentifier("x-file-name"),
            t.stringLiteral(normalizedPath),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-line-number"),
            t.stringLiteral(String(lineNumber)),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-component"),
            t.stringLiteral(elementName),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-id"),
            t.stringLiteral(`${normalizedPath}_${lineNumber}`),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-dynamic"),
            t.stringLiteral(isDynamic ? "true" : "false"),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("data-debug-wrapper"),
            t.stringLiteral("true"),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("style"),
            t.jsxExpressionContainer(
              t.objectExpression([
                t.objectProperty(
                  t.identifier("display"),
                  t.stringLiteral("contents"),
                ),
              ]),
            ),
          ),
        ];
        if (keyAttr?.value) {
          wrapperAttrs.push(
            t.jsxAttribute(t.jsxIdentifier("key"), t.cloneNode(keyAttr.value)),
          );
        }

        const wrapper = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier("div"), wrapperAttrs, false),
          t.jsxClosingElement(t.jsxIdentifier("div")),
          [jsxPath.node],
          false,
        );

        jsxPath.replaceWith(wrapper);
      },

      // Add metadata to native HTML elements (lowercase JSX)
      JSXOpeningElement(jsxPath, state) {
        if (!jsxPath.node.name || !jsxPath.node.name.name) {
          return;
        }

        const elementName = jsxPath.node.name.name;

        // Skip fragments
        if (elementName === "Fragment") {
          return;
        }

        // Only process lowercase (native HTML)
        if (/^[A-Z]/.test(elementName)) {
          return;
        }

        // Skip if already has metadata
        const hasDebugAttr = jsxPath.node.attributes.some(
          (attr) =>
            t.isJSXAttribute(attr) &&
            attr.name &&
            attr.name.name &&
            attr.name.name.startsWith("x-"),
        );
        if (hasDebugAttr) return;

        // Get source location
        const filename =
          state.filename ||
          state.file?.opts?.filename ||
          state.file?.sourceFileName ||
          "unknown";

        const lineNumber = jsxPath.node.loc?.start.line || 0;

        if (!fileNameCache.has(filename)) {
          const base = path.basename(filename).replace(/\.[jt]sx?$/, "");
          fileNameCache.set(filename, base);
        }
        const normalizedPath = fileNameCache.get(filename) || "unknown";

        // Detect if native element is inside an array iteration or has expressions
        const parentJSXElement = jsxPath.findParent((p) => p.isJSXElement());
        const isDynamic = parentJSXElement
          ? isJSXDynamic(parentJSXElement) ||
            hasAnyExpression(parentJSXElement.node)
          : false;

        // Add metadata attributes
        insertMetaAttributes(jsxPath.node, [
          t.jsxAttribute(
            t.jsxIdentifier("x-file-name"),
            t.stringLiteral(normalizedPath),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-line-number"),
            t.stringLiteral(String(lineNumber)),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-component"),
            t.stringLiteral(elementName),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-id"),
            t.stringLiteral(`${normalizedPath}_${lineNumber}`),
          ),
          t.jsxAttribute(
            t.jsxIdentifier("x-dynamic"),
            t.stringLiteral(isDynamic ? "true" : "false"),
          ),
        ]);
      },
    },
  };
}

module.exports = babelMetadataPlugin;
