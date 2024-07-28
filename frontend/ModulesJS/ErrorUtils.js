export default function error(data, number=0) {
    this.querySelectorAll('#error-content')[number].style.display = "block";
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
	console.log(firstValue)
    const error = this.querySelectorAll('my-error')[number]
    error.setAttribute('name', firstKey);
    error.setAttribute('content', firstValue);
    setTimeout(() => {
        const div = this.querySelectorAll('#error-content');
        if (Object.keys(div).length != 0) {
            div[number].style.display = "none";
        }
    }, 3000);
}