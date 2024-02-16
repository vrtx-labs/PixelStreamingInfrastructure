const shareButton = document.getElementById('shareButton');

shareButton.onclick = function(e) {
    const descriptor = {
        Link: true
    };
    emitUIInteraction(descriptor);
    console.log("descriptor", descriptor);
}