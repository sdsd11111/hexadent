import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (optional, using default Helvetica for compatibility)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        // Removed fixed height or using objectFit to ensure logo displays correctly
    },
    headerImage: {
        width: '100%',
        height: '100%',
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
        height: '100%',
        objectFit: 'fill',
    },
    content: {
        flexDirection: 'column',
    },
    section: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    fieldContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 2,
    },
    value: {
        fontSize: 10,
        color: '#111827',
    },
    imageContainer: {
        marginTop: 10,
        width: '100%',
        height: 200,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    figure: {
        width: '80%',
        height: 180,
        objectFit: 'contain',
    }
});

const FichaDocument = ({ data = {}, logoUrl = '/pdf-header.jpg', footerUrl = '/pdf-footer.jpg' }) => {
    // Note: logoUrl and footerUrl are swapped here based on your feedback 
    // that the previous ones were reversed.

    const renderSection = (sectionId, title) => {
        const sectionData = data[`section${sectionId}`] || {};

        // This is a generic way to render fields from the data object
        // Assuming data structure like: data.section1 = { field1: 'value', ... }
        // Or if it's flat: data.section1_field1

        return (
            <View key={sectionId} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{sectionId}. {title}</Text>

                {/* Dynamically render fields if they exist as sectionX_fieldY */}
                {Object.keys(data)
                    .filter(key => key.startsWith(`section${sectionId}_`))
                    .map(key => {
                        const label = key.split('_')[1].replace('field', 'Campo ').replace('select', 'Selección').replace('textarea', 'Observaciones');
                        return (
                            <View key={key} style={styles.fieldContainer}>
                                <Text style={styles.label}>{label}:</Text>
                                <Text style={styles.value}>{data[key] || 'No especificado'}</Text>
                            </View>
                        );
                    })}

                {/* Placeholder for Images/Figures if mentioned in sections */}
                {title.toLowerCase().includes('imagen') || title.toLowerCase().includes('figura') ? (
                    <View style={styles.imageContainer}>
                        <Text style={{ color: '#9CA3AF', fontSize: 8 }}>[ Espacio para Diagrama / Figura ]</Text>
                    </View>
                ) : null}
            </View>
        );
    };

    const sectionTitles = [
        "Datos del Paciente",
        "Historia Clínica",
        "Examen Físico",
        "Diagnóstico",
        "Plan de Tratamiento",
        "Presupuesto",
        "Evolución",
        "Radiografías",
        "Consentimiento",
        "Recetas",
        "Observaciones Finales"
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header} fixed>
                    <Image src={logoUrl} style={styles.headerImage} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {sectionTitles.map((title, index) => renderSection(index + 1, title))}
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Image src={footerUrl} style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default FichaDocument;
