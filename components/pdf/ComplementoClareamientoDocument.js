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
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginTop: 5,
        textTransform: 'uppercase',
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
        fontFamily: 'Helvetica-Bold',
    },
    bulletText: {
        fontSize: 10,
        flex: 1,
        textAlign: 'justify',
        lineHeight: 1.4,
    },
    doctorSignature: {
        marginTop: 40,
        alignItems: 'center',
    },
    doctorName: {
        fontSize: 14,
        fontFamily: 'Times-Italic',
        marginBottom: 2,
    },
    doctorTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    consentSection: {
        marginTop: 50,
        borderTopWidth: 1,
        borderTopColor: '#CCC',
        paddingTop: 15,
    },
    consentTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    consentText: {
        fontSize: 9,
        lineHeight: 1.5,
        textAlign: 'justify',
    },
    inputLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
        minWidth: 150,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        marginTop: 10,
    }
});

const ComplementoClareamientoDocument = ({ data = {} }) => {
    const recommendations = data.recommendations || [
        "Molestias por sensibilidad tiene un tiempo estimado de 3 a 5 días, puede ser dolor agudo el primer día, luego del procedimiento.",
        "Evitar alimentos muy fríos o calientes, ya que puede producir sensibilidad dentaria.",
        "Evita ingerir ciertos alimentos y bebidas que puedan provocar una pigmentación dental, como en el caso del: Café, té, vino tinto, bebidas energizantes, caramelos, chocolates, frutos rojos, entre otros por 2 meses. Cítricos entre ellos se encuentran las frutas ácidas como el Kiwi, la piña, naranja, lima y limones.",
        "USAR SORBETE para ingerir bebidas con colorantes",
        "Evita fumar",
        "No uso de enjuagues bucales por 2 días",
        "Utiliza una pasta de dientes sensibles",
        "Mantener una buena y constante higiene bucal (Puede presentarse sensibilidad durante el cepillado dental)",
        "La cubeta individual mantenerla limpia y seca"
    ];

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
                    <Text style={styles.title}>{data.title || 'CLAREAMIENTO DENTAL'}</Text>
                    <Text style={styles.subtitle}>{data.subtitle || 'RECOMENDACIONES POST TRATAMIENTO'}</Text>
                </View>

                <View style={styles.contentSection}>
                    {recommendations.map((rec, index) => (
                        <View key={index} style={styles.bulletPoint}>
                            <Text style={styles.bulletNumber}>{index + 1}.</Text>
                            <Text style={styles.bulletText}>{rec}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.doctorSignature}>
                    <Text style={styles.doctorName}>{data.doctorName || 'Dra. Diana Rodríguez'}</Text>
                    <Text style={styles.doctorTitle}>{data.doctorTitle || 'ODONTÓLOGA- ORTODONCISTA'}</Text>
                </View>

                <View style={styles.consentSection}>
                    <Text style={styles.consentTitle}>CONSENTIMIENTO INFORMADO</Text>
                    <View style={styles.row}>
                        <Text style={styles.consentText}>PACIENTE: </Text>
                        <Text style={[styles.consentText, { borderBottom: '1 solid black', flex: 1 }]}>{data.patientName || '..................................................................'}</Text>
                        <Text style={styles.consentText}> C.I. </Text>
                        <Text style={[styles.consentText, { borderBottom: '1 solid black', width: 100 }]}>{data.patientCI || '......................................'}</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.consentText}>
                            He comprendido claramente los efectos y cuidados posteriores al clareamiento dental, por lo que autorizo a la {data.doctorName || 'Dra. Diana Rodríguez'} a realizar el procedimiento.
                        </Text>
                    </View>
                    <View style={[styles.row, { marginTop: 20 }]}>
                        <Text style={styles.consentText}>FIRMA DE RESPONSABILIDAD: </Text>
                        <Text style={[styles.consentText, { borderBottom: '1 solid black', width: 200 }]}>{data.signature || '....................................................'}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <Text style={styles.consentText}>Fecha: </Text>
                        <Text style={[styles.consentText, { borderBottom: '1 solid black', width: 100 }]}>{data.date || '............................'}</Text>
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default ComplementoClareamientoDocument;
