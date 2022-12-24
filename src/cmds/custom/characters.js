const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const disableAllButtons = require("../../utils/disableAllButtons");
const CharacterController = require("../../controllers/CharacterController");
const { calculateLevel } = require("../../utils/levelingForms");
const uppercaseFirstLetter = require("../../utils/uppercaseFirstLetter");
const attributesUtils = require("../../utils/attributesUtils");

const races = [
	{ 
		name: "human",
		value: "human",
		emoji: "👨",
		description: "Human",
		selected: true,
		history: "Human history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "elf",
		value: "elf",
		emoji: "🧝",
		description: "Elf",
		selected: true,
		history: "Elf history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "dwarf",
		value: "dwarf",
		emoji: "🧔",
		description: "Dwarf",
		selected: true,
		history: "Dwarf history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "orc",
		value: "orc",
		emoji: "👹",
		description: "Orc",
		selected: true,
		history: "Orc history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "gnome",
		value: "gnome",
		emoji: "🧙",
		description: "Gnome",
		selected: true,
		history: "Gnome history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	}
]

const classes = [
	{
		name: "warrior",
		value: "warrior",
		emoji: "⚔️",
		description: "Warrior",
		selected: true,
		history: "Warrior history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "paladin",
		value: "paladin",
		emoji: "🛡️",
		description: "Paladin",
		selected: true,
		history: "Paladin history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "hunter",
		value: "hunter",
		emoji: "🏹",
		description: "Hunter",
		selected: true,
		history: "Hunter history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "rogue",
		value: "rogue",
		emoji: "🗡️",
		description: "Rogue",
		selected: true,
		history: "Rogue history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "priest",
		value: "priest",
		emoji: "🧙",
		description: "Priest",
		selected: true,
		history: "Priest history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "death_knight",
		value: "death_knight",
		emoji: "🦇",
		description: "Death Knight",
		selected: true,
		history: "Death Knight history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "shaman",
		value: "shaman",
		emoji: "🌊",
		description: "Shaman",
		selected: true,
		history: "Shaman history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	},
	{
		name: "mage",
		value: "mage",
		emoji: "🧙",
		description: "Mage",
		selected: true,
		history: "Mage history",
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1
		}
	}
]

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
					.setLabel(LanguagesController.content(`messages.characters.creationCharacterDefaults.confirm`, { option: `{%messages.characters.creationCharacterDefaults.${type.toLowerCase()}Option}` }))
					.setEmoji('✅')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel(LanguagesController.content(`messages.characters.creationCharacterDefaults.cancel`, { option: `{%messages.characters.creationCharacterDefaults.${type.toLowerCase()}Option}` }))
					.setEmoji('❌')
					.setStyle(ButtonStyle.Danger),
			]
		}

		const charactersComponents = []
		
		if (charactersButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(charactersButtons))
		charactersComponents.push(new ActionRowBuilder().addComponents(actionsButtons))
		
		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })
		
		const filter = (i) => i.user.id === interaction.user.id
		
		const collector = charactersMsg.createMessageComponentCollector({ filter, time: 30000 })
		
		var action = {
			name: '',
			active: false,
			step: 0,
			stepMax: 1,
			character: {
				name: '',
				gender: 0,
			},
		}
		
		const creationCharacter = async () => {
			const creationEmbed = {
				color: 0x36393f,
				title: LanguagesController.content("messages.characters.charactersEmbed.title") + ` ${action.step}/${action.stepMax}`,
				timestamp: new Date().toISOString(),
				description: `
${LanguagesController.content(`messages.characters.creationCharacterStepDescription.step${action.step}`)}
${action.character.baseAttributes ? `${LanguagesController.content(`attributes.attributesnoun`)}\n${Object.keys(action.character.baseAttributes).map((attribute) => `${LanguagesController.content(`attributes.${attribute}`)}: ${action.character.baseAttributes[attribute]}`).join('\n')}` : ''}
`
			}
			const creationComponents = () => {
				const components = [
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
							.setLabel(LanguagesController.content(`messages.characters.creationCharacterDefaults.confirm`, { option: `{%messages.characters.creationCharacterDefaults.${action.check.toLowerCase()}Option}` }))
							.setEmoji('✅')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('cancel')
							.setLabel(LanguagesController.content(`messages.characters.creationCharacterDefaults.cancel`, { option: `{%messages.characters.creationCharacterDefaults.${action.check.toLowerCase()}Option}` }))
							.setEmoji('❌')
							.setStyle(ButtonStyle.Danger)
					])
				]

				if (action.step === 0) {
					components.push(new ActionRowBuilder().addComponents([
						new ButtonBuilder()
							.setCustomId('selectname')
							.setLabel(LanguagesController.content(`messages.characters.charactersButtons.setname`, { character_name: action.character.name }))
							.setEmoji('📝')
							.setStyle(ButtonStyle.Secondary)
					]))
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectgender')
							.setPlaceholder(LanguagesController.content(`messages.characters.creationCharacterDefaults.select`, { option: `{%genders.gendernoun}` }))
							.addOptions([
								{
									label: LanguagesController.content(`genders.male`),
									value: "male",
									emoji: '♂️',
									default: action.character.gender === "male"
								},
								{
									label: LanguagesController.content(`genders.female`),
									value: "female",
									emoji: '♀️',
									default: action.character.gender === "female"
								},
								{
									label: LanguagesController.content(`genders.other`),
									value: "other",
									emoji: '🏳️‍🌈',
									default: action.character.gender === "other"
								}
							])
					]))
				}
				if (action.step === 1) {
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectrace')
							.setPlaceholder(LanguagesController.content(`messages.characters.creationCharacterDefaults.select`, { option: `{%messages.characters.creationCharacterDefaults.race}` }))
							.addOptions(races.filter(race => race.selected).map((race) => {
								return {
									label: race.name,
									value: race.value,
									emoji: race.emoji,
									description: race.description,
									default: action.character.race === race.name
								}
							}))
					]))
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectclass')
							.setPlaceholder(LanguagesController.content(`messages.characters.creationCharacterDefaults.select`, { option: `{%messages.characters.creationCharacterDefaults.class}` }))
							.addOptions(classes.filter(character_class => character_class.selected).map((character_class) => {
								return {
									label: character_class.name,
									value: character_class.value,
									emoji: character_class.emoji,
									description: character_class.description,
									default: action.character.class === character_class.name
								}
							}))
					]))
				}

				return components
			}

			return { creationEmbed, creationComponents }
		}

		collector.on('update_embed' , async (i) => {
			const { creationEmbed, creationComponents } = await creationCharacter()
			return i.editReply({ embeds: [creationEmbed], components: creationComponents() })
		})

		collector.on('collect', async (i) => {

			if (i.isStringSelectMenu()) {
				i.deferUpdate().then(async () => {
					action.character[i.customId.replace("select", "")] = i.values[0]
					if (['selectrace', 'selectclass'].includes(i.customId)) {
						action.character.baseAttributes = attributesUtils.mergeAttributes(races.find((race) => race.value == action.character.race)?.baseAttributes, classes.find((character_class) => character_class.value == action.character.class)?.baseAttributes)
					}
				})
			}

			if (!i.isButton()) return

			if (i.customId === 'selectname') {

				const modal = new ModalBuilder()
				.setCustomId('charactername_modal')
				.setTitle(LanguagesController.content("messages.modals.character_name_modal.title"))

				const nameInput = new TextInputBuilder()
					.setCustomId('namemodal')
					.setLabel(LanguagesController.content("messages.modals.character_name_modal.fieldname").slice(0, 45))
					.setStyle(TextInputStyle.Short)
					.setMinLength(5)
					.setMaxLength(20)
					.setRequired(true)

				modal.addComponents(new ActionRowBuilder().addComponents(nameInput));

				return i.showModal(modal).then(async () => {
					const submitted = await i.awaitModalSubmit({
						time: 60000,
						filter: i => i.user.id === interaction.user.id,
					  }).catch(error => {
						i.followUp({ content: LanguagesController, ephemeral: true })
						return null
					  })
					  
					  if (submitted) {
						const chracter_name = submitted.fields.getTextInputValue('namemodal')
						action.character.name = chracter_name
						submitted.reply({ content: LanguagesController.content("messages.modals.character_name_modal.success", { character_name: chracter_name }), ephemeral: true })
						return collector.emit('update_embed', i)
					}
				})

			}
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
				collector.emit('update_embed', i)
			}
		})

		collector.on('action', async (i) => {

			if (action.check === 'Create' && i.customId === 'confirm') { 
				action.active = true
				collector.emit('update_embed', i)
			} else if (action.check === 'Create' && i.customId === 'cancel') {
				collector.stop()
			}

		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}
