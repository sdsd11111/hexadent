import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
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
    },
    title: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
        fontSize: 10,
    },
    label: {
        fontFamily: 'Helvetica-Bold',
        marginRight: 5,
    },
    field: {
        borderBottom: '1 solid #000',
        minWidth: 50,
        paddingBottom: 1,
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderColor: '#000',
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        fontSize: 9,
        minHeight: 25,
        alignItems: 'center',
    },
    cell: {
        padding: 5,
        borderRightWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
    },
    cellNoBorder: {
        padding: 5,
        justifyContent: 'center',
    },
    colNum: { width: '8%', textAlign: 'center' },
    colFecha: { width: '15%', textAlign: 'center' },
    colMes: { width: '47%' },
    colValor: { width: '15%', textAlign: 'center' },
    colFirma: { width: '15%' },
    totalRow: {
        flexDirection: 'row',
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        backgroundColor: 'transparent',
    },
    totalLabel: {
        width: '70%',
        padding: 8,
        textAlign: 'right',
        borderRightWidth: 1,
        borderColor: '#000',
        textDecoration: 'underline',
    },
    totalValue: {
        width: '15%',
        padding: 8,
        textAlign: 'center',
        borderRightWidth: 1,
        borderColor: '#000',
    }
});

const TratamientoIntegralDocument = ({ data = {} }) => {
    const plan = data.plan_tratamiento || [];
    const total = data.plan_tratamiento_total || 0;
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : '—';

    // Ensure at least 10 rows for visual consistency if empty
    const rows = [...plan];
    while (rows.length < 1) {
        rows.push({ fecha: '', mes_control: '', valor: '' });
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.backgroundImageContainer} fixed>
                    <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
                </View>
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                <Text style={styles.title}>REGISTRO DE PAGO POR TRATAMIENTO INTEGRAL ODONTOLÓGICO</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>FECHA:</Text>
                    <Text style={[styles.field, { width: 100 }]}>{formatDate(data.fecha)}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', width: '70%' }}>
                        <Text style={styles.label}>PACIENTE:</Text>
                        <Text style={[styles.field, { flex: 1 }]}>{data.nombre || ''} {data.apellido || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '25%' }}>
                        <Text style={styles.label}>EDAD:</Text>
                        <Text style={[styles.field, { flex: 1, textAlign: 'center' }]}>{data.edad || ''}</Text>
                        <Text style={{ fontSize: 10, marginLeft: 5 }}>años</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.cell, styles.colNum]}>#</Text>
                        <Text style={[styles.cell, styles.colFecha]}>FECHA</Text>
                        <Text style={[styles.cell, styles.colMes]}>MES DE CONTROL</Text>
                        <Text style={[styles.cell, styles.colValor]}>VALOR $</Text>
                        <Text style={[styles.cellNoBorder, styles.colFirma]}>FIRMA</Text>
                    </View>

                    {rows.map((row, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.cell, styles.colNum, { backgroundColor: '#F3F4F6' }]}>{index + 1}</Text>
                            <Text style={[styles.cell, styles.colFecha]}>{row.fecha ? formatDate(row.fecha) : ''}</Text>
                            <Text style={[styles.cell, styles.colMes]}>{row.mes_control || ''}</Text>
                            <Text style={[styles.cell, styles.colValor]}>{row.valor ? Number(row.valor).toFixed(2) : ''}</Text>
                            <Text style={[styles.cellNoBorder, styles.colFirma]}></Text>
                        </View>
                    ))}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL CANCELADO</Text>
                        <Text style={styles.totalValue}>{Number(total).toFixed(2)}</Text>
                        <View style={styles.colFirma} />
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default TratamientoIntegralDocument;
