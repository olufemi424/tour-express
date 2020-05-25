/* eslint-disable */
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  console.log(el);
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  m;
  //remove alert
  window.setTimeout(hideAlert, 5000);
};
