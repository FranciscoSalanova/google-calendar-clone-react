export const formatDate = (date, options) => {
  return new Intl.DateTimeFormat(undefined, options).format(date)
}
