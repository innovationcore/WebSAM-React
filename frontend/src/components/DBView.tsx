import React from "react";
import config from "../../config";

function DBView() {
    const [data, setData] = React.useState([]); // tracks data for display in db view

    // Get data from server, save it to a variable to make it iterable so we can print it below, line by line
    const getData = async () => {
        await fetch(config.server+'/populate')
            .then(res => res.json())
            .then(data => {
              setData(data)
            })
    }

    return(
        <>
        </>
    );
}
export default DBView;