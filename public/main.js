import Vue from './vue.js'
import { Grafo } from './Grafo.js'
import { Screen } from './Screen.js'
import { Input } from './Input.js'
import { Dijkstra } from './Dijkstra.js'
import { Dij } from './Dij.js'


/**
 * Função principal de execução e controle da aplicação
 */
export const main = async () => {
    const app = new Vue({
        el: '#app',
        data: {
            form: {
                colunas: 2,
                start: 'a',
                end: 'a'
            },
            result: {
                caminho: [],
                peso: 0
            },
            grafo: {},
            screen: {},
            input: {},
            dijkstra: {},
            matriz: []
        },
        mounted () {
            this.grafo = new Grafo (3, this.form.colunas)
            this.dijkstra = new Dijkstra(this.grafo)
            this.input = new Input
            this.screen = new Screen({
                grafo: this.grafo,
                input: this.input,
                screen: this.$refs['screen'],
            })

            this.screen.render(requestAnimationFrame)
            this.atualizaMatriz(requestAnimationFrame)
        },
        computed: {
            distanciaManhattan () {
                if (!this.grafo || !this.grafo.vertices)
                    return '-'
                const start = this.grafo.vertices[this.form.start]
                const end = this.grafo.vertices[this.form.end]

                return Math.abs((start.pos.x - end.pos.x) + (start.pos.y - end.pos.y))
            }
        },
        methods: {
            setColunas (e) {
                const value = e.target.value

                if (value < 2 || value > 6)
                    return
                
                this.form.colunas = value
                
                // Para o render, corrige as variáveis, recomeça o render
                this.screen.lock()
                this.screen.clear()
                this.grafo.colunas = this.form.colunas
                this.resetarArestas()
                this.screen.unlock()
                this.screen.resize()
                this.screen.render(requestAnimationFrame)
            },
            setDijkstraInput (type, e) {
                const value = e.target.value
                if (!(value in this.grafo.vertices))
                    return
                
                this.form[type] = value
            },
            runDijkstra () {
                const verticeInicial = this.grafo.vertices[this.form.start]
                const verticeFinal = this.grafo.vertices[this.form.end]

                const melhorCaminho = this.dijkstra.melhorCaminho(verticeInicial, verticeFinal)

                this.result = melhorCaminho
            },
            /**
             * Desfaz as arestas no grafo e reseta
             * os vértices de Início e Fim no formulário
             */
            resetarArestas () {
                this.grafo.reset()
                this.form.start = 'a'
                this.form.end = 'a'
                this.result.caminho = []
                this.result.peso = 0
            },
            /**
             * A cada frame, atualiza a matriz na tela
             */
            atualizaMatriz (requestAnimationFrame) {
                this.matriz = this.grafo.matriz(true)
                requestAnimationFrame(() => {
                    this.atualizaMatriz(requestAnimationFrame)
                })
            },
            /**
             * Pega as classes para estilização do item da matriz
             * 
             * @param {string} item Item da matriz de adjacência
             * @param {number} idx Índice do item na linha da matriz
             */
            getClasses (item, idx) {
                return {
                    'text-blue text-bold': !['-', '0'].includes(item) && idx !== 0,
                    'text-invisible': item === '-',
                    'text-bold': idx === 0
                }
            }
        }
    })
}
