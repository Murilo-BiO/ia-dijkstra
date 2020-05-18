export class Screen {
    /** @type {HTMLCanvasElement} */
    cvs = null

    /** @type {CanvasRenderingContext2D} */
    ctx = null

    /** @type {import('./Grafo').Grafo} */
    grafo = null

    /** @type {boolean} */
    locked = false

    /** @type {import('./Input').Input} */
    input = null

    estiloDoGrafo = {
        raio: 15,
        raioHover: 15 * 1.1, // 10% maior
        distancia: 70,
        margem: 40,
        aresta: {
            larguraDaLinha: '5',
            larguraDaLinhaHover: '10',
            cor: '#000',
            corHover: '#555',
            estiloDoMouse: 'default',
            estiloDoMouseHover: 'pointer',
        },
        vertice: {
            larguraDaLinha: '1',
            alinhamentoDoTexto: 'center',
            linhaBaseDoTexto: 'middle',
            corDoTexto: '#000',
            fonteDoTexto: '15px Verdana',
            estiloDoMouse: 'default',
            estiloDoMouseHover: 'pointer',
            corDoVertice: '#fff',
            corDoVerticeHover: '#efefef',
            corDoVerticeSemArestas: '#c7d2f0'
        },

    }

    /** @type {import('./Grafo').Vertice}*/
    _selecionado = null

    set selecionado (v) {
        this._selecionado = v
    }

    get selecionado () {
        return this._selecionado
    }

    constructor ({ screen, style = {}, grafo, input }) {
        this.grafo = grafo

        this.cvs = screen
        this.ctx = this.cvs.getContext('2d')

        this.resize()

        this.estiloDoGrafo = { ...this.estiloDoGrafo, ...style }
        
        this.input = input
        this.input.register(this.cvs)
    }

    clear () {
        this.lock()
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
    }

    resize () {
        const width = this.estiloDoGrafo.distancia * (this.grafo.colunas - 1) + 2 * this.estiloDoGrafo.margem
        const height = this.estiloDoGrafo.distancia * (this.grafo.linhas - 1) + 2 * this.estiloDoGrafo.margem

        this.cvs.width = width
        this.cvs.height = height
    }

    render (requestAnimationFrame) {
        if (this.locked)
            return

        const boundary = this.cvs.getBoundingClientRect()
        const cursor = {
            x: this.input.mouse.x - boundary.left,
            y: this.input.mouse.y - boundary.top
        }

        const click = {
            x: this.input.mouse.click.x - boundary.left,
            y: this.input.mouse.click.y - boundary.top
        }

        const getTarget = (pos) => {
            // Prioridade para Vértice
            for (const key in this.grafo.vertices) {
                const v = this.grafo.vertices[key]
                const vx = this.estiloDoGrafo.margem + v.pos.x * this.estiloDoGrafo.distancia
                const vy = this.estiloDoGrafo.margem + v.pos.y * this.estiloDoGrafo.distancia
                const x = (pos.x - vx)
                const y = (pos.y - vy)
                const r = this.estiloDoGrafo.raio ** 2
                const distance = x ** 2 + y ** 2

                if (distance <= r)
                    return { type: 'vertice', target: v }
            }

            // se não achou target de vértice, vê se tem aresta
            const viewed = []
            for (const key in this.grafo.vertices) {
                const v = this.grafo.vertices[key]
                
                if (Object.keys(v.arestas).length < 1)
                    continue
                
                for (const adj in v.arestas) {
                    const a = v.arestas[adj]
                    let vx, vy
                    
                    if (viewed.includes(a))
                        continue // Já viu essa aresta
                    
                        
                    this.ctx.beginPath()
                    this.ctx.lineWidth = this.estiloDoGrafo.aresta.larguraDaLinha
                    vx = this.estiloDoGrafo.margem + a.vertices[0].pos.x * this.estiloDoGrafo.distancia
                    vy = this.estiloDoGrafo.margem + a.vertices[0].pos.y * this.estiloDoGrafo.distancia
                    this.ctx.moveTo(vx, vy)
                    vx = this.estiloDoGrafo.margem + a.vertices[1].pos.x * this.estiloDoGrafo.distancia
                    vy = this.estiloDoGrafo.margem + a.vertices[1].pos.y * this.estiloDoGrafo.distancia
                    this.ctx.lineTo(vx, vy)
                    this.ctx.closePath()

                    if (this.ctx.isPointInStroke(pos.x, pos.y)) {
                        return { type: 'aresta', target: a }
                    }
                }
            }

            // Chegou até aqui, n tem target nenhum
            return { type: 'none', target: null }
        }

        const clickTarget = () => {
            const { type, target } = getTarget(click)

            switch (type) {
                case 'vertice':
                    if (this.selecionado === null) {
                        this.selecionado = target
                    } else if (this.selecionado !== target) {
                        this.grafo.conectar(this.selecionado.name, target.name)
                        this.selecionado = null
                        this.input.clear()
                    }
                    break
                case 'aresta':
                    // Click na aresta irá removê-la
                    this.grafo.desconectar(target)
                    this.selecionado = null
                    this.input.clear()
                    break
                case 'none':
                    // Foi um click qualquer.
                    break
            }

            return null
        }

        const hoverTarget = () => {
            const result = getTarget(cursor)

            if (!result.target)
                return null
            
            return result
        }

        
        const hover = hoverTarget()
        clickTarget()

        // Limpa o canvas
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)

        // Itera por todos os vértices e arestas para atualizar o visual
        const drawed = []
        const pos = { x: 0 + this.estiloDoGrafo.margem, y: 0 + this.estiloDoGrafo.margem }
        Object.values(this.grafo.vertices)
            .map(v => {
                let x, y

                // Arestas primeiro para que não atrapalhe o Vértice
                for (const adj in v.arestas) {
                    const a = v.arestas[adj]
                    const style = this.estiloDoGrafo.aresta

                    if (drawed.includes(a))
                        continue

                    x = pos.x + a.vertices[0].pos.x * this.estiloDoGrafo.distancia
                    y = pos.y + a.vertices[0].pos.y * this.estiloDoGrafo.distancia
                    this.ctx.beginPath()
                    this.ctx.moveTo(x, y)
                    x = pos.x + a.vertices[1].pos.x * this.estiloDoGrafo.distancia
                    y = pos.y + a.vertices[1].pos.y * this.estiloDoGrafo.distancia
                    this.ctx.lineTo(x, y)
                    if (hover && hover.target === a) {
                        this.ctx.strokeStyle = style.corHover
                        this.ctx.lineWidth = style.larguraDaLinhaHover
                        this.cvs.style.cursor = style.estiloDoMouseHover
                    } else {
                        this.ctx.strokeStyle = style.cor
                        this.ctx.lineWidth = style.larguraDaLinha
                        this.cvs.style.cursor = style.estiloDoMouse
                    }
                    this.ctx.stroke()
                    this.ctx.closePath()

                    drawed.push(a)
                }

                const style = this.estiloDoGrafo.vertice
                let radius, cor, pointer

                if (hover && hover.target === v || this.selecionado == v) {
                    radius = this.estiloDoGrafo.raioHover
                    cor = style.corDoVerticeHover
                } else {
                    radius = this.estiloDoGrafo.raio
                    cor = style.corDoVertice
                }

                x = pos.x + v.pos.x * this.estiloDoGrafo.distancia
                y = pos.y + v.pos.y * this.estiloDoGrafo.distancia
                this.ctx.beginPath()
                this.ctx.arc(x, y, radius, 0, Math.PI * 2, false)
                this.ctx.fillStyle = Object.keys(v.arestas).length > 0 ? cor : style.corDoVerticeSemArestas
                this.ctx.lineWidth = style.larguraDaLinha
                this.ctx.fill()
                this.ctx.stroke()
                this.ctx.closePath()

                this.ctx.font = style.fonteDoTexto
                this.ctx.textAlign = style.alinhamentoDoTexto
                this.ctx.textBaseline = style.linhaBaseDoTexto
                this.ctx.fillStyle = style.corDoTexto
                this.ctx.fillText(v.name, x, y)

                // Se pelo menos um item estiver com hover, o cursor deve ser ser pointer
                pointer = hover ? style.estiloDoMouseHover : style.estiloDoMouse
                this.cvs.style.cursor = pointer
            })

        if (requestAnimationFrame) {
            requestAnimationFrame(() => {
                this.render(requestAnimationFrame)
            })
        }
    }

    lock () {
        this.locked = true
    }

    unlock (requestAnimationFrame) {
        this.locked = false
        this.render(requestAnimationFrame)
    }
}
