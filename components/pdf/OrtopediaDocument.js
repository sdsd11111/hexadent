import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingLeft: 50,
        paddingRight: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 70,
    },
    headerImage: {
        width: '100%',
        height: 80,
        objectFit: 'fill',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    footerImage: {
        width: '100%',
        height: 80,
        objectFit: 'fill',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        backgroundColor: '#FAF5FF',
        padding: 5,
        borderLeft: '3 solid #9333EA',
        paddingLeft: 8,
    },
    field: {
        marginBottom: 6,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 2,
    },
    value: {
        fontSize: 10,
        color: '#1F2937',
        paddingLeft: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    column: {
        flex: 1,
        marginRight: 10,
    },
});

const OrtopediaDocument = ({ data = {} }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                {/* Content */}
                <View>
                    {/* Sección 1: Datos del Paciente */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Datos del Paciente</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section1_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section1_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section1_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 2: Historia Clínica Ortodóntica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Historia Clínica Ortodóntica</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section2_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section2_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section2_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 3: Análisis Facial */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Análisis Facial</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section3_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section3_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section3_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 4: Análisis Intraoral */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Análisis Intraoral</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section4_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section4_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section4_textarea || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* New Page for remaining sections */}
                <View break>
                    {/* Sección 5: Análisis Cefalométrico */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Análisis Cefalométrico</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section5_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section5_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section5_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 6: Diagnóstico Ortodóntico */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Diagnóstico Ortodóntico</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section6_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section6_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section6_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 7: Objetivos del Tratamiento */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Objetivos del Tratamiento</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section7_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section7_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section7_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 8: Plan de Tratamiento */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Plan de Tratamiento</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section8_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section8_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section8_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 9: Aparatología */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. Aparatología</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section9_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section9_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section9_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 10: Seguimiento y Controles */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>10. Seguimiento y Controles</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section10_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section10_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section10_textarea || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Sección 11: Resultados y Retención */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>11. Resultados y Retención</Text>
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Campo de texto:</Text>
                                    <Text style={styles.value}>{data.section11_field1 || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.column}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>Selección:</Text>
                                    <Text style={styles.value}>{data.section11_select || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Observaciones:</Text>
                            <Text style={styles.value}>{data.section11_textarea || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default OrtopediaDocument;
