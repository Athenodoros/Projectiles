import { NodeSimulation } from "../nodes";
import { Renderer } from "../renderer";
import { setClickListenersOnRenderer } from "./clicks";
import { setTouchListenersOnRenderer } from "./touches";

// Popup Handling
const popup = document.getElementById("backdrop")!;

export const setInteractivityListeners = (
    renderer: Renderer,
    nodes: NodeSimulation,
    getPauseState: () => boolean,
    togglePauseState: () => void,
    changeStageNumber: (type: "increase" | "decrease") => void,
    clearProjectileView: () => void
) => {
    const togglePauseStateAndPopup = () => {
        togglePauseState();
        popup.style.display = getPauseState() ? "flex" : "none";
        console.log("flip");
    };

    // Listeners on canvas
    setTouchListenersOnRenderer(renderer, nodes, togglePauseStateAndPopup, changeStageNumber);
    setClickListenersOnRenderer(renderer, nodes);

    // Popup Handling
    popup.onclick = togglePauseStateAndPopup;

    // Key Handling
    document.onkeydown = (event) => {
        if (event.code === "Space") togglePauseStateAndPopup();
        if (event.code === "KeyC") clearProjectileView();
        if (event.code === "ArrowRight") changeStageNumber("increase");
        if (event.code === "ArrowLeft") changeStageNumber("decrease");
    };
};
