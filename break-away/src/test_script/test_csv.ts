import { CSVUtility } from "../lib/csv-utility";

CSVUtility.parseCSVFile('./content/messages.csv')
    .then((data) => {
        console.log("CSV data loaded successfully:", data);
    })
    .catch((error) => {
        console.error("Failed to load CSV data:", error);
    });
