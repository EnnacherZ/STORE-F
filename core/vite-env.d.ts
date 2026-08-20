/// <reference types="vite/client" />

// swiper's CSS subpath exports have no file extension, so Vite's generic
// `*.css` wildcard (from the vite/client reference above) doesn't cover
// them — same declarations as the host app needs for the same reason.
declare module 'swiper/css';
declare module 'swiper/css/bundle';
declare module 'swiper/css/navigation';
declare module 'swiper/css/free-mode';
declare module 'swiper/css/thumbs';
