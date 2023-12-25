(function () {
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'setImage':
                {
                    const img = document.querySelector('#image-container img');
                    if (message.imageUrl) {
                        img.setAttribute('style', '');
                        img.setAttribute('src', message.imageUrl);
                        img.setAttribute('title', message.tooltip);
                    } else {
                        img.setAttribute('style', 'display: none;');
                        img.setAttribute('src', '');
                        img.setAttribute('title', '');
                    }

                    break;
                }
        }
    });
})();
