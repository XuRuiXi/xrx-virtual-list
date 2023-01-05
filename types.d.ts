declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.html';

declare module '*.less' {
  const less: { readonly [key: string]: string };
  export default less;
}
