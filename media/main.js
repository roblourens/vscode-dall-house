(function() {
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'setImage':
                {
                    document.querySelector('#image-container img').setAttribute('src', message.imageUrl);
                    break;
                }
        }
    });
})();
