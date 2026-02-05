import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
        color: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    headerImage: {
        width: '100%',
        height: 80,
        objectFit: 'cover',
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
    backgroundImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.1,
    },
    titleContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-BoldOblique', // Using Oblique for Italic effect
        textAlign: 'center',
        textTransform: 'uppercase',
        textDecoration: 'underline',
    },
    contentSection: {
        marginTop: 10,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bulletNumber: {
        fontSize: 10,
        width: 20,
        fontFamily: 'Helvetica',
    },
    bulletText: {
        fontSize: 10,
        flex: 1,
        textAlign: 'justify',
        lineHeight: 1.4,
        fontFamily: 'Helvetica',
    },
    doctorSignature: {
        marginTop: 50,
        alignItems: 'flex-start', // Left aligned based on image
        marginLeft: 20,
    },
    doctorName: {
        fontSize: 14,
        fontFamily: 'Times-BoldItalic', // Trying to match the script-like font in image
        marginBottom: 2,
    },
    emergencyText: {
        fontSize: 10,
        fontFamily: 'Helvetica',
        marginTop: 10,
    },
    emergencySection: {
        marginTop: 40,
        marginLeft: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    }
});

const ComplementoPostquirurgicoDocument = ({ data = {} }) => {
    const defaultRecs = [
        "Muerda una gasa estéril después de la intervención quirúrgica durante una hora.",
        "No escupir con fuerza.",
        "Terapia de frío primeras 48 horas (bolsa de hielo) extraoral, después calor húmedo a partir del segundo día.",
        "No tocar la herida, realizar la higiene oral con cuidado.",
        "No enjuague la boca durante las primeras 48 horas. No se debe escupir ni hacer movimientos repetitivos de succión, no tomar líquidos con sorbete. Si hace estas acciones puede desalojarse el coagulo e interrumpir el proceso normal de cicatrización.",
        "Dieta líquida primer día, segundo día dieta blanda a temperatura ambiente, beber abundantes líquidos. Evitar alimentos irritantes, masticar por el lado no intervenido si es posible. Evitar los granos y alimentos nocivos. No comer carne de chancho, mariscos, lácteos.",
        "Reposo (no realizar actividad física), Mantener una postura en que la cabeza este a nivel más alto del cuerpo (dormir semi sentado).",
        "Si aparece un sangrado anormal, doble una gasa estéril, colóquela sobre la zona y muerda durante 30 minutos.",
        "Recomendamos no fumar durante el postoperatorio (por lo menos 15 días después de la intervención quirúrgica). No tome alcohol, ni bebidas carbonatadas.",
        "Lavados con jeringa y suero fisiológico a partir del tercer día, después de cada comida."
    ];

    const recommendations = data.recommendations && data.recommendations.length > 0 ? data.recommendations : defaultRecs;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.backgroundImageContainer} fixed>
                    <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
                </View>
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{data.title || 'INDICACIONES Y RECOMENDACIONES POSTQUIRURGICAS'}</Text>
                </View>

                <View style={styles.contentSection}>
                    {recommendations.map((rec, index) => {
                        // Apply custom bolding for specific key phrases if it matches default text
                        // Simplified approach: Render text text fragments if it matches strict criteria, else normal text.
                        // For flexibility, we will just bold the whole line if it contains specific keywords as previously done, 
                        // OR we can try to split by known delimiters if users edit it. 
                        // Given the editor allows free text, robust bolding of specific words is hard without a rich text editor.
                        // We will replicate the visual from the image for the DEFAULT text case.

                        let content = <Text style={styles.bulletText}>{rec}</Text>;

                        if (rec.includes("Dieta líquida")) {
                            content = (
                                <Text style={styles.bulletText}>
                                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>Dieta líquida</Text> primer día, segundo día dieta blanda a temperatura ambiente, beber abundantes líquidos. Evitar alimentos irritantes, masticar por el lado no intervenido si es posible. Evitar los granos y alimentos nocivos.{'\n'}
                                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>               No comer</Text> carne de chancho, mariscos, lácteos.
                                </Text>
                            );
                        }

                        return (
                            <View key={index} style={styles.bulletPoint}>
                                <Text style={styles.bulletNumber}>{index + 1}. </Text>
                                {content}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.emergencySection}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica' }}>11. En caso de urgencia llamar al teléfono:</Text>
                        <Text style={styles.doctorName}>{data.doctorName || 'Dra. Diana Rodríguez'}</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica', alignSelf: 'flex-end', marginTop: 5 }}>{data.emergencyNumber || '0967885039'}</Text>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default ComplementoPostquirurgicoDocument;
