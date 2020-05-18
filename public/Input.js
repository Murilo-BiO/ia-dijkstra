export class Input {
    /** @type {{ x: number, y: number, click: { x: number, y: number }, clicked: boolean }} */
    mouse = {
        x: 0,
        y: 0,
        click: {
            x: 0,
            y: 0
        },
        clieked: false
    }

    /** @type {MouseEvent} */
    mouseMove (e) {
        this.mouse.x = e.clientX
        this.mouse.y = e.clientY
    }

    /** @type {MouseEvent} */
    mouseClick (e) {
        this.mouse.click = {
            x: e.clientX,
            y: e.clientY
        }
    }

    mouseDown (e) {
        this.mouseClick(e)
        this.mouse.clicked = true
    }

    mouseUp (e) {
        this.mouseClick(e)
        this.mouse.clicked = false
    }

    clear () {
        this.mouse.clicked = false
        this.mouse.click.x = 0
        this.mouse.click.y = 0
        this.mouse.x = 0
        this.mouse.y = 0
    }

    register (el) {
        el.addEventListener('mousemove', (e) => this.mouseMove(e))
        el.addEventListener('click', (e) => this.mouseClick(e))
    }
}
