export default function isAlphanumeric(url: string) {
  return url.match(/^[a-z0-9]+$/i) != null;
}
