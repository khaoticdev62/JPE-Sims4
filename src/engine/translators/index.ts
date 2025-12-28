/**
 * Translator Module
 *
 * Provides bidirectional conversion between XML and JPE formats.
 *
 * Usage:
 * ```
 * import { xmlToJpe, jpeToXml } from '@/engine/translators'
 * import { tokenize, parse } from '@/engine/jpe'
 * import { XMLParser } from '@/engine/parsers/XMLParser'
 *
 * // XML → JPE
 * const xmlElement = XMLParser.parseXML(xmlString)
 * const jpeString = xmlToJpe(xmlElement)
 *
 * // JPE → XML
 * const tokens = tokenize(jpeString)
 * const jpeAst = parse(tokens)
 * const xmlElement = jpeToXml(jpeAst)
 * ```
 */

export { XMLToJPETranslator, xmlToJpe } from './xmlToJpe'
export { JPEToXMLTranslator, jpeToXml } from './jpeToXml'
