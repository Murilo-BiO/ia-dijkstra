import Vue from './vue.js'
import { Grafo } from './Grafo.js'
import { Screen } from './Screen.js'
import { Input } from './Input.js'



/**
 * Tela para display do grafo
 * 
 * @param {HTMLCanvasElement} screen Referência do canvas
 */
export const main = async (canvas) => {
    const shared = {
        dadosGrafo: {
            colunas: 2,
            linhas: 3,
            colunasMin: 2,
            colunasMax: 6,
        },
        grafo: null,
        screen: null,
        input: null,
        matriz: ''
    }
    
    const boxA = new Vue({
        el: '#a',
        data: shared,
        created () {
            this.input = new Input
        },
        methods: {
            gerarGrafo () {
                this.validarInput()
                this.grafo = new Grafo(this.dadosGrafo.linhas, this.dadosGrafo.colunas)
                console.log(this.grafo.vertices.a)
                this.renderizarGrafo()
            },
            validarInput () {
                const max = Math.max(this.dadosGrafo.colunas, this.dadosGrafo.colunasMin)
                this.dadosGrafo.colunas = Math.min(max, this.dadosGrafo.colunasMax)
            },
            renderizarGrafo () {
                if (!this.input)
                    return console.log('Não configurou input')

                this.screen = new Screen({
                    screen: canvas,
                    grafo: this.grafo,
                    input: this.input
                })

                this.screen.render(requestAnimationFrame)
            },
            resetarGrafo () {
                this.grafo = null
                this.colunas = undefined
                this.screen.clear()
                this.screen = null
            }
        }
    })

    const boxC = new Vue({
        el: '#c',
        data: shared,
        computed: {
            
        }
    })
    const boxD = new Vue({
        el: '#d',
        data: shared,
        created () {
            this.getMatrix(requestAnimationFrame)
        },
        methods: {
            getMatrix (requestAnimationFrame) {
                if (this.grafo)
                    this.matriz = this.grafo.matriz(true).replace(/\n/g, '<br>')

                if (requestAnimationFrame)
                    requestAnimationFrame(() => {
                        this.getMatrix(requestAnimationFrame)
                    })
            }
        }
    })



    // const grafo = new Grafo(3, 3)
    // const screen = new Screen({
    //     screen: canvas,
    //     input: new Input,
    //     grafo,
    // })
    // screen.render(requestAnimationFrame)
}
