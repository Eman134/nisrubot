const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require("discord.js");
const disableAllButtons = require("../../utils/disableAllButtons");
const CharacterController = require("../../controllers/CharacterController");
const { calculateLevel } = require("../../utils/levelingForms");
const uppercaseFirstLetter = require("../../utils/uppercaseFirstLetter");

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.characters.name'),
			description: client.languages.content('commands.characters.description'),
			permissions: ['user'],
		});
	}
	async execute(interaction, characters) {

		const LanguagesController = this.client.languages

		const Character = new CharacterController(this.client, interaction.user)

		Character.setCharactersCache(characters)

		const charactersFields = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return {
				name: character.name,
				value: LanguagesController.content("messages.characters.charactersEmbed.level", { level: calculateLevel(character.exp) }),
				inline: true
			}
		})

		const charactersEmbed = {
			color: 0x36393f,
			title: LanguagesController.content("messages.characters.charactersEmbed.title"),
			timestamp: new Date().toISOString(),
			fields: charactersFields,
			description: LanguagesController.content("messages.characters.charactersEmbed.description", { has_character: characters.characters.length > 0 })
		}

		const charactersButtons = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return new ButtonBuilder()
				.setCustomId(`select${index}`)
				.setLabel(LanguagesController.content("messages.characters.charactersButtons.select", { character_name: character.name }))
				.setEmoji('👤')
				.setStyle(ButtonStyle.Secondary)
		})

		const actionsButtons = [
			new ButtonBuilder()
				.setCustomId('create')
				.setLabel(LanguagesController.content("messages.characters.charactersButtons.create"))
				.setEmoji('👤')
				.setStyle(ButtonStyle.Primary),
		]

		if (characters.selected) {
			actionsButtons.push(
				new ButtonBuilder()
					.setCustomId('customize')
					.setLabel(LanguagesController.content("messages.characters.charactersButtons.customize", { character_name: characters.selected.name }))
					.setEmoji('1054051525204385882')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel(LanguagesController.content("messages.characters.charactersButtons.delete", { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('sell')
					.setLabel(LanguagesController.content("messages.characters.charactersButtons.sell", { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Success)
			)
		}

		const checkButtons = (type) => {
			return [
				new ButtonBuilder()
					.setCustomId('confirm')
					.setLabel(LanguagesController.content(`messages.characters.charactersButtons.confirm${type}`))
					.setEmoji('✅')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel(LanguagesController.content(`messages.characters.charactersButtons.cancel${type}`))
					.setEmoji('❌')
					.setStyle(ButtonStyle.Danger),
			]
		}

		const charactersComponents = []
		
		if (charactersButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(charactersButtons))
		charactersComponents.push(new ActionRowBuilder().addComponents(actionsButtons))
		
		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })
		
		const filter = (i) => i.user.id === interaction.user.id
		
		const collector = charactersMsg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 15000 })
		
		var action = {
			name: '',
			active: false,
			step: 0,
			stepMax: 1
		}
		
		const creationCharacter = async () => {
			const creationEmbed = {
				color: 0x36393f,
				title: LanguagesController.content("messages.characters.creationCharacterEmbed.title") + ` ${action.step}/${action.stepMax}`,
				timestamp: new Date().toISOString(),
				description: LanguagesController.content("messages.characters.creationCharacterEmbed.description")
			}
			const creationComponents = () => {
				return [
					new ActionRowBuilder().addComponents([
						new ButtonBuilder()
							.setCustomId('back')
							.setLabel(LanguagesController.content("messages.characters.creationCharacterButtons.back"))
							.setEmoji('⬅️')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(action.step === 0),
						new ButtonBuilder()
							.setCustomId('next')
							.setLabel(LanguagesController.content("messages.characters.creationCharacterButtons.next"))
							.setEmoji('➡️')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(action.step === action.stepMax),
						new ButtonBuilder()
							.setCustomId('confirmcreation')
							.setLabel(LanguagesController.content("messages.characters.creationCharacterButtons.confirm"))
							.setEmoji('✅')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('cancel')
							.setLabel(LanguagesController.content("messages.characters.creationCharacterButtons.cancel"))
							.setEmoji('❌')
							.setStyle(ButtonStyle.Danger)
					])
				]
			}

			return { creationEmbed, creationComponents }
		}

		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				collector.resetTimer()

				if (action.check && ['confirm', 'cancel'].includes(i.customId)) return collector.emit('action', i)

				if (action.active) return collector.emit('step', i)
				
				if (!action.check && !['confirm', 'cancel'].includes(i.customId) && !i.customId.includes('select')) {
					action.check = uppercaseFirstLetter(i.customId)
					charactersComponents.push(new ActionRowBuilder().addComponents(checkButtons(action.check)))
					charactersComponents.forEach((row) => {
						row.components.forEach((button) => {
							if (button.data.custom_id === i.customId) button.data.disabled = true
						})
					})
					return charactersMsg.edit({ components: charactersComponents })
				}

				action.name = i.customId.includes('select') ? 'select' : i.customId


			})
		})

		collector.on('step', async (i) => {
			if (["next", "back"].includes(i.customId)) {
				action.step = i.customId === "next" ? action.step + 1 : action.step - 1
				action.step = action.step < 0 ? 0 : action.step
				action.step = action.step > action.stepMax ? action.stepMax : action.step
				collector.emit('stepUpdate', i)
			}
		})

		collector.on('stepUpdate', async (i) => {
			const { creationEmbed, creationComponents } = await creationCharacter()
			charactersMsg.edit({ embeds: [creationEmbed], components: creationComponents() })
		})

		collector.on('action', async (i) => {

			if (action.check === 'Create' && i.customId === 'confirm') { 
				action.active = true
				collector.emit('stepUpdate', i)
			} else if (action.check === 'Create' && i.customId === 'cancel') {
				collector.stop()
			}

		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}
