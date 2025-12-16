import { useEffect } from "react";

export default function useDisableScroll() {
  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();

    document.body.addEventListener("touchmove", preventScroll, {
      passive: false,
    });

    return () => {
      document.body.removeEventListener("touchmove", preventScroll);
    };
  }, []);
}
