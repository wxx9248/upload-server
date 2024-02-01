import urlJoin from "url-join";

export const API_ROOT = urlJoin(
    import.meta.env.VITE_SERVER,
    import.meta.env.VITE_BASE === "/" ? "" : import.meta.env.VITE_BASE,
    import.meta.env.VITE_API
);
