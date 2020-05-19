class PriorityQueue {
    constructor () {
        this.collection = []
    }

    enqueue (vertice) {
        if (this.isEmpty()) {
            this.collection.push(vertice)
            return
        }
        
        // debugger
        for (let i = 1; i <= this.collection.length; i++) {
            const item = this.collection[i - 1]

            if (vertice[1] > item[1])
                continue

            this.collection.splice(i - 1, 0, vertice)
            // this.collection.push(vertice)
            break
        }
    }

    dequeue () {
        return this.collection.shift()
    }

    isEmpty () {
        return this.collection.length === 0
    }
}

class Adjacente {
    /** @type {import('./Grafo').Vertice} */
    vertice = null

    /** @type {number} */
    peso = 0

    constructor (vertice, peso) {
        this.vertice = vertice
        this.peso = peso
    }
}

export class Dijkstra {

    /** @type {{ [nomeDoVertice: string]: Adjacente[] }} */
    adjacentes = {}

    /** @type {import('./Grafo').Grafo} */
    grafo = null

    /**
     * @param {import('./Grafo').Vertice} grafo Instância do Grafo que iremos usar
     */
    constructor (grafo) {
        this.grafo = grafo  
    }

    prepararAdjacentes () {
        this.adjacentes = {}

        for (const nomeVertice in this.grafo.vertices) {
            const v = this.grafo.vertices[nomeVertice]
            // Inicializa lista
            this.adjacentes[v.name] = []
        }

        Object.values(this.grafo.vertices)
            .forEach(v => {
                for (const nomeAresta in v.arestas) {
                    const a = v.arestas[nomeAresta]

                    const [ va, vb ] = a.vertices

                    if (!this.adjacentes[va.name].some(adj => adj.vertice === vb))
                        this.adjacentes[va.name].push(new Adjacente(vb, a.peso))
                    
                    if (!this.adjacentes[vb.name].some(adj => adj.vertice === va))
                        this.adjacentes[vb.name].push(new Adjacente(va, a.peso))
                }
            })
    }

    /**
     * Retorna o melhor caminho no gravo de um vértice à outro
     * se não for um caminho possível, retorna `null`
     * 
     * @param {import('./Grafo').Vertice} verticeInicial Instância do Vértice inicial
     * @param {import('./Grafo').Vertice} verticeFinal Instância do Vértice final
     */
    melhorCaminho (verticeInicial, verticeFinal) {
        this.prepararAdjacentes()
        
        /** @type {{ [nomeDoVertice: string]: number }} */
        let distancias = {}
        let caminhoPercorrido = {}
        let queue = new PriorityQueue()

        // Distância para o ponto onde estamos é 0
        distancias[verticeInicial.name] = 0

        // inicializa a distância para vértices não visitados como infinito
        // se no final ainda estiver como infinito, é porque não dá pra alcançá-lo
        for (const verticeName in this.grafo.vertices) {
            if (this.grafo.vertices[verticeName] !== verticeInicial) {
                distancias[verticeName] = Infinity
                queue.enqueue([ verticeName, Infinity ])
            }
        }

        // Inclui o início na fila
        queue.enqueue([ verticeInicial.name, 0 ])

        // Visita todos os vértices adjacentes alcançáveis
        while (!queue.isEmpty()) {
            const [ verticeAtual ] = queue.dequeue()
            
            // verifica todos os adjacentes desse vértice
            for (const adj of this.adjacentes[verticeAtual]) {
                const distancia = distancias[verticeAtual] + adj.peso

                // Achou um caminho mais perto para este vértice
                if (distancia < distancias[adj.vertice.name]) {

                    // Atualiza a distância para esse vértice visitado
                    distancias[adj.vertice.name] = distancia

                    // Atualiza o caminho para esse novo vértice
                    caminhoPercorrido[adj.vertice.name] = verticeAtual

                    // Coloca esse melhor caminho na fila.
                    queue.enqueue([ adj.vertice.name, distancia ])
                }
            }
        }
        
        console.log('e', distancias)

        // Se a distância até o vértice final ainda for infinita
        // significa que não é um vértice acessível.
        if (distancias[verticeFinal.name] === Infinity)
            return null

        // Se chegou até aqui, o caminho é válido.
        // Vamos construí-lo para retorná-lo.
        const caminho = [ verticeFinal.name ]
        let proximoPasso = verticeFinal.name

        // Realiza o caminho de volta, do vértice final ao inicial,
        // utilizando o melhor caminho encontrado e salva no array.
        while (proximoPasso && proximoPasso !== verticeInicial.name) {
            caminho.unshift(caminhoPercorrido[proximoPasso])
            proximoPasso = caminhoPercorrido[proximoPasso]
        }

        return { caminho, peso: distancias[verticeFinal.name] }
    }
}