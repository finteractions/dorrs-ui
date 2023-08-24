import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import {faFilePdf, faImage, faFile} from "@fortawesome/free-solid-svg-icons";
import path from "path";

function getIcon(name: string) {
    const image_ext_arr = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.tiff', '.jfif', '.webp', '.ico'];
    const pdf_ext_arr = ['.pdf'];

    let icon: IconDefinition;

    const fileExtension = path.extname(name).toLowerCase();

    if (pdf_ext_arr.includes(fileExtension)) {
        icon = faFilePdf;
    } else if (image_ext_arr.includes(fileExtension)) {
        icon = faImage;
    } else {
        icon = faFile;
    }

    return icon;
}



const adminFileService = {

    getIcon
}

export default adminFileService;
