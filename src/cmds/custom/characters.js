const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, SelectMenuBuilder } = require("discord.js");
const disableAllButtons = require("../../utils/disableAllButtons");
const CharacterController = require("../../controllers/CharacterController");
const LanguagesController = require("../../controllers/LanguagesController");
const { calculateLevel } = require("../../utils/levelingForms");

const messages = {
	name: "characters",
	description: "Visualize e gerencie seus personagens",
	charactersEmbed: {
		level: "Level {level}",
		title: "Menu de Personagens",
		description: "{?has_character} Selecione um personagem para visualizar seus dados{?has_character}\n{!has_character} Você não possui nenhum personagem{!has_character}",
	},
	charactersButtons: {
		create: "Criar novo personagem",
		select: "Selecionar {character_name}",
		confirmSelect: "Confirmar seleção",
		cancelSelect: "Cancelar seleção",
		delete: "Excluir {character_name}",
		confirmDelete: "Confirmar exclusão",
		cancelDelete: "Cancelar exclusão",
		customize: "Customizar {character_name}",
		sell: "Vender {character_name}",
		confirmSell: "Confirmar venda",
		cancelSell: "Cancelar venda",
	},
}

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: messages.name,
			description: messages.description,
			permissions: ['user'],
		});
	}
	async execute(interaction, characters) {

		const { setStrValues } = new LanguagesController(interaction.user.language)

		const Character = new CharacterController(this.client, interaction.user)

		Character.setCharactersCache(characters)

		const charactersFields = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return {
				name: character.name,
				value: setStrValues(messages.charactersEmbed.level, { level: calculateLevel(character.exp) }),
				inline: true
			}
		})

		const charactersEmbed = {
			color: 0x36393f,
			title: messages.charactersEmbed.title,
			timestamp: new Date().toISOString(),
			fields: charactersFields,
			description: setStrValues(messages.charactersEmbed.description, { has_character: characters.characters.length > 0 })
		}

		const charactersButtons = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return new ButtonBuilder()
				.setCustomId(`select${index}`)
				.setLabel(setStrValues(messages.charactersButtons.select, { character_name: character.name }))
				.setEmoji('👤')
				.setStyle(ButtonStyle.Secondary)
		})

		const actionsButtons = [
			new ButtonBuilder()
				.setCustomId('create')
				.setLabel(messages.charactersButtons.create)
				.setEmoji('👤')
				.setStyle(ButtonStyle.Primary),
		]

		if (characters.selected) {
			actionsButtons.push(
				new ButtonBuilder()
					.setCustomId('customize')
					.setLabel(setStrValues(messages.charactersButtons.customize, { character_name: characters.selected.name }))
					.setEmoji('1054051525204385882')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel(setStrValues(messages.charactersButtons.delete, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('sell')
					.setLabel(setStrValues(messages.charactersButtons.sell, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Success)
			)
		}

		const charactersComponents = []
		
		if (charactersButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(charactersButtons))
		charactersComponents.push(new ActionRowBuilder().addComponents(actionsButtons))

		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })

		const filter = (interaction) => interaction.user.id === interaction.user.id

		const collector = charactersMsg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 10000 })

		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				collector.resetTimer()
				if (i.customId === 'create') {
					//start create character
				}
				if (i.customId === 'customize') {
					//start customize character
				}
				if (i.customId === 'delete') {
					//start delete character
				}
				if (i.customId === 'sell') {
					//start sell character
				}
				if (i.customId.includes('select')) {
					//start select character
				}
			})
		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}
