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
    bulletTextBold: {
        fontSize: 10,
        flex: 1,
        textAlign: 'justify',
        lineHeight: 1.4,
        fontFamily: 'Helvetica-Bold',
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
    emergencySection: {
        marginTop: 40,
        marginBottom: 10,
    },
    emergencyText: {
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    emergencyNumber: {
        fontSize: 10,
        marginTop: 10,
        fontFamily: 'Helvetica',
    },
});

const ComplementoFrenectomiaDocument = ({ data = {} }) => {
    const defaultRecs = [
        "No levantar la lengua para verse la herida",
        "Limitar el habla durante las primeras horas de cirugía",
        "No escupir con fuerza",
        "Habrá sensación de dificultad para tragar la saliva",
        "Cuando pasa el efecto de la anestesia y baja la inflamación se sienten los hilos de sutura puede picar es normal",
        "Puede presentar un color morado en la base es la lengua es normal",
        "No tocar la herida, realizar la higiene oral con cuidado con jeringa",
        "No enjuague la boca durante las primeras 48 horas. No se debe escupir ni hacer movimientos repetitivos de succión, no tomar líquidos con sorbete.",
        "Dieta blanda primer y segundo día a temperatura ambiente, beber abundantes líquidos. Evitar alimentos irritantes.",
        "No comer carne de chancho, mariscos, lácteos.", // Bold is handled by logic or data flag
        "Reposo (no realizar actividad de esfuerzo físico por 8 días), Mantener una postura en que la cabeza este a nivel más alto del cuerpo (dormir semi sentado), el primer día",
        "Recomendamos no fumar durante el postoperatorio (por lo menos 15 días después de la intervención quirúrgica). No alcohol",
        "En caso de continuar con problemas para pronunciación de sonidos se recomienda interconsulta con FONIATRA"
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
                        // Check if specific items should be bold. In this case, item 10 (index 9) in default.
                        // Or if user passes a specific structure. For generic, we check if text starts with "No comer carne" maybe?
                        // Or better, let's keep it simple. If we edit it, we lose the bold unless we support rich text.
                        // For now, I'll check exact string match for the default bold item for best effort.
                        const isBold = rec.includes("No comer carne de chancho");
                        const style = isBold ? styles.bulletTextBold : styles.bulletText;
                        const numberStyle = isBold ? { fontFamily: 'Helvetica-Bold', fontSize: 10, width: 20 } : styles.bulletNumber;

                        return (
                            <View key={index} style={styles.bulletPoint}>
                                <Text style={numberStyle}>{index + 1}. </Text>
                                <Text style={style}>{rec}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.emergencySection}>
                    <Text style={styles.emergencyText}>14. En caso de urgencia llamar al teléfono:</Text>
                    <Text style={styles.emergencyNumber}>{data.emergencyNumber || '0967885039'}</Text>
                </View>

                <View style={styles.doctorSignature}>
                    <Text style={styles.doctorName}>{data.doctorName || 'Dra. Diana Rodríguez'}</Text>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default ComplementoFrenectomiaDocument;
