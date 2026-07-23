/** Exécute une init DB une seule fois (évite ALTER/CREATE à chaque requête). */
export function once(fn) {
  let promise = null;
  return function runOnce(...args) {
    if (!promise) {
      promise = Promise.resolve()
        .then(() => fn(...args))
        .catch((err) => {
          promise = null;
          throw err;
        });
    }
    return promise;
  };
}
