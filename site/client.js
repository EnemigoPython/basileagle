async function getData() {
    const res = await fetch("server.php");
    console.log(res);
    return await res.json()
}

window.onload = async () => {
    let someData = await getData();
    console.log(someData);
};
