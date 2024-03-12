const icon = document.querySelector('.bg-gray.px-4.py-2.bg-light');
const message = document.querySelector('.messages-box');
const chatBox = document.querySelector('.chat-box');
const form = document.querySelector('form'); 


icon.addEventListener('click', () => {
    message.classList.toggle('mode');
    chatBox.classList.toggle('mode');
    form.classList.toggle('mode');
    icon.classList.toggle('icon');
    icon.classList.toggle('.bg-gray.px-4.py-2.bg-light');
});
