/**
 * Return a random color code
 *
 * @returns {string} - Random color code
 */
export function getRandomColor() {
    const colors = ["#007BFF", "#6610F2", "#7367F0", "#E83E8C", "#EA5455", "#FD7E14", "#FF9F43", "#28C76F", "#20C997", "#00CFE8"];
    return colors[Math.floor(Math.random() * 10)]
}
