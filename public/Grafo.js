export class Vertice {
    /** @type {{ x: number, y: number }} */
    pos = {
        x: undefined,
        y: undefined
    }

    /** @type {string} */
    name = ''

    /** @type {{ [nomeVertice: string]: { peso: number, vertices: Vertice[] } }} */
    arestas = {}

    constructor (name, x, y) {
        this.pos.x = x
        this.pos.y = y

        this.name = name
    }

    static make (name, x, y) {
        return new Vertice(name, x, y)
    }
}

export class Grafo {
    /** @type {{ [nomeVertice: string]: Vertice}} */
    vertices = {}

    /** @type {number} */
    linhas = 3

    /** @type {number} */
    colunas = 6

    constructor (linhas, colunas) {
        this.linhas = linhas
        this.colunas = colunas

        this.init()
    }

    /**
     * Gera os vértices do grafo
     */
    init () {
        for (let i = 0; i < this.colunas; i++) {
            for (let j = 0; j < this.linhas; j++) {
                const name = String.fromCharCode(97 + Object.keys(this.vertices).length)
                this.vertices[name] = Vertice.make(name, i, j)
            }
        }
    }

    /**
     * Limpa a lista de vértices do Grafo.
     */
    reset () {
        for (const prop in this.vertices)
            delete this.vertices[prop]
        
        this.init()
    }

    /**
     * Conecta dois vértices e cria uma aresta com peso baseado na distância
     * 
     * @param {string} a Nome do primeiro vertice
     * @param {string} b Nome do outro vértice
     */
    conectar (a, b) {
        if (a === b)
            return false

        const va = this.vertices[a]
        const vb = this.vertices[b]

        
        if (b in va.arestas && a in vb.arestas)
            return true

        if (Math.abs(va.pos.x - vb.pos.x) > 1 || Math.abs(va.pos.y - vb.pos.y) > 1)
            return false

        let w = 0
        
        if (va.pos.x === vb.pos.x || va.pos.y === vb.pos.y)
            w = 1 // Vertical ou Horizontal
        else
            w = Math.SQRT2 // Diagonal

        const aresta = {
            peso: w,
            vertices: [ va, vb ]
        }

        va.arestas[b] = vb.arestas[a] = aresta

        return true
    }

    /**
     * Desconecta uma aresta.
     * 
     * @param {{ peso: number, vertices: Vertice[] }} aresta 
     */
    desconectar (aresta) {
        for (const v of aresta.vertices) {
            for (const a in v.arestas) {
                if (v.arestas[a] === aresta)
                    delete v.arestas[a]
            }
        }
    }

    /**
     * Gera a matriz adjacente otimizada do Grafo
     */
    matriz (toString = false) {
        const matriz = []
        const names = Object.keys(this.vertices)

        if (names.length < 1)
            return matriz

        const getRow = (remaining) => {
            const [ ignored, ...cols ] = remaining

            if (!ignored)
                return
            
            const row = [0] // 0 do ignored

            for (const name of cols) {
                const arestas = this.vertices[ignored].arestas
                row.push(name in arestas ? arestas[name].peso : 0)
            }

            matriz.push(row)
            getRow(cols)
        }

        getRow(names)
        
        if (toString) {
            matriz.unshift(names)
            const spaces = []

            return matriz.map((row, idx) => {

                row = [...spaces, ...row]
                row.unshift(idx === 0 ? '-' : names[idx - 1])
                if (idx > 0)
                    spaces.push('-')
                return row.map(item => {
                    return item === Math.SQRT2 ? '√2' : `${item}`
                })

            })
        }

        return matriz
    }
}