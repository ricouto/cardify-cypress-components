import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})

Cypress.Commands.add('fillCardForm', (myCard) => {
  cy.get('[data-cy="number"]').type(myCard.number)
  cy.get('[data-cy="holderName"]').type(myCard.holderName)
  cy.get('[data-cy="expirationDate"]').type(myCard.expirationDate)
  cy.get('[data-cy="cvv"]').type(myCard.cvv)
  cy.get(`[data-cy="bank-${myCard.bank}"]`).click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click()
})

describe('<AddCard />', () => {

  const myCard = {
      number: '5555555555554444',
      holderName: 'Paulo Gomes',
      expirationDate: '12/35',
      cvv: '123',
      bank: 'neon'
    }

  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })

  it('Exibe erros quando os campos nao sao informados ', () => {
    // see: https://on.cypress.io/mounting-react
    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    cy.submitCardForm()

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })

    // cy.alertErrorHaveText('Número do cartão é obrigatório')
    // cy.alertErrorHaveText('Nome do titular é obrigatório')
    // cy.alertErrorHaveText('Data de expiração é obrigatória')
    // cy.alertErrorHaveText('CVV é obrigatório')
    // cy.alertErrorHaveText('Selecione um banco')
  })

  it('Deve cadastrar um novo cartao de credito', () => {
    
    cy.fillCardForm({...myCard})

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (req) => {
      req.reply({
        statusCode: 201,
        body: myCard
      })
    }).as('addCard')

    cy.submitCardForm()
    cy.wait('@addCard')

    cy.get('.notice-sucess')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso!')
  })

  it('Valida nome de titular com menos de 2 caracteres', () => {
    cy.fillCardForm({...myCard, holderName: 'P'})
    cy.submitCardForm()

    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')
  })

  it('Valida data de expiracao invalida', () => {
    cy.fillCardForm({...myCard, expirationDate: '13/35'})
    cy.submitCardForm()

    cy.alertErrorHaveText('Data de expiração inválida ou vencida')
  })

  it('Valida CVV com menos de 3 digitos', () => {
    cy.fillCardForm({...myCard, cvv: '9'})
    cy.submitCardForm()

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')
  })

})