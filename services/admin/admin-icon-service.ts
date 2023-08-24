import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import {faCheck, faXmark, faQuestion} from "@fortawesome/free-solid-svg-icons";

function iconBoolean (active: boolean) {
    let icon: IconDefinition;

    switch (active) {
        case true:
            icon = faCheck
            break
        case false:
            icon = faXmark
            break
        default:
            icon = faQuestion
            break
    }

    return icon
}


const adminIconService = {
    iconBoolean
}

export default adminIconService;
