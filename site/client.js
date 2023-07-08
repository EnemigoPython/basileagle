async function getData() {
    const res = await fetch("server.php?action=storyText");
    console.log(res);
    return await res.json()
}

window.onload = async () => {
    let someData = await getData();
    console.log(someData);
};
