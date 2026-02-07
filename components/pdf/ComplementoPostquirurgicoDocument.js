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
        fontFamily: 'Helvetica-BoldOblique',
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
    doctorName: {
        fontSize: 11,
        fontFamily: 'Times-Italic',
    },
    phoneNumber: {
        fontSize: 10,
        fontFamily: 'Helvetica',
        textAlign: 'center',
        marginTop: 2,
    },
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
        "Lavados con jeringa y suero fisiológico a partir del tercer día, después de cada comida.",
        "En caso de urgencia llamar al teléfono: Dra. Diana Rodríguez 0967885039"
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
                    <Text style={styles.title}>{data.title || 'INDICACIONES Y RECOMENDACIONES POSTQUIRÚRGICAS'}</Text>
                </View>

                <View style={styles.contentSection}>
                    {recommendations.map((rec, index) => {
                        let content = <Text style={styles.bulletText}>{rec}</Text>;

                        // Point 6: Bold formatting for "Dieta líquida" and "No comer"
                        if (rec.includes("Dieta líquida")) {
                            content = (
                                <Text style={styles.bulletText}>
                                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>Dieta líquida</Text> primer día, segundo día dieta blanda a temperatura ambiente, beber abundantes líquidos. Evitar alimentos irritantes, masticar por el lado no intervenido si es posible. Evitar los granos y alimentos nocivos.{'\n'}
                                    <Text style={{ marginLeft: 14 }}>     <Text style={{ fontFamily: 'Helvetica-Bold' }}>No comer</Text> carne de chancho, mariscos, lácteos.</Text>
                                </Text>
                            );
                        }

                        // Point 11: Special formatting with doctor name in italic
                        if (rec.includes("En caso de urgencia")) {
                            content = (
                                <Text style={styles.bulletText}>
                                    En caso de urgencia llamar al teléfono:  <Text style={styles.doctorName}>{data.doctorName || 'Dra. Diana Rodríguez'}</Text>{'\n'}
                                    <Text style={{ textAlign: 'center', display: 'block', width: '100%', marginTop: 2 }}>                                                       {data.emergencyNumber || '0967885039'}</Text>
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

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default ComplementoPostquirurgicoDocument;
