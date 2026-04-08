import { JPEDecompiler } from '../services/translation/decompiler'

describe('JPEDecompiler Adversarial Hardening', () => {
    const decompiler = new JPEDecompiler()

    test('should decompile multi-loot lists correctly', () => {
        const xml = `
            <I c="Interaction" i="interaction" m="interactions.base.interaction" n="MultiLoot" s="0x1">
                <L n="basic_extras">
                    <V t="loot">
                        <U n="loot">
                            <L n="loot_list">
                                <T>Loot_A</T>
                                <T>Loot_B</T>
                            </L>
                        </U>
                    </V>
                </L>
            </I>
        `
        const jpe = decompiler.decompile(xml)
        expect(jpe).toContain('- loot: Loot_A')
        expect(jpe).toContain('- loot: Loot_B')
    })

    test('should handle raw string list items correctly (fast-xml-parser edge case)', () => {
        const xml = `
            <I c="Interaction" i="interaction" m="interactions.base.interaction" n="RawList" s="0x2">
                <L n="test_globals">
                    <T n="priority">10</T>
                </L>
            </I>
        `
        const jpe = decompiler.decompile(xml)
        expect(jpe).toContain('priority: 10')
    })

    test('should decompile multi-trait whitelists correctly', () => {
        const xml = `
            <I c="Interaction" i="interaction" m="interactions.base.interaction" n="MultiTrait" s="0x3">
                <L n="test_globals">
                    <V t="trait">
                        <U n="trait">
                            <L n="whitelist_traits">
                                <T>Trait_1</T>
                                <T>Trait_2</T>
                                <T>Trait_3</T>
                            </L>
                        </U>
                    </V>
                </L>
            </I>
        `
        const jpe = decompiler.decompile(xml)
        expect(jpe).toContain('- trait: Trait_1')
        expect(jpe).toContain('- trait: Trait_2')
        expect(jpe).toContain('- trait: Trait_3')
    })
})
