export default function error(data, number) {
    this.querySelectorAll('#error-content')[number].style.display = "block";
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    const error = this.querySelectorAll('my-error')[number]
    error.setAttribute('name', firstKey);
    error.setAttribute('content', firstValue);
}