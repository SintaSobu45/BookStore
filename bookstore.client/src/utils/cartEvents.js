export const notifyCartUpdated = () => {
  window.dispatchEvent(new Event("cartUpdated"));
};