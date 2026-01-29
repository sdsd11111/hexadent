import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, G, Line, Circle, Path } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 85,
        paddingBottom: 85,
        paddingHorizontal: 40,
        fontSize: 10,
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
    },
    section: {
        marginBottom: 3,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: 'transparent',
        paddingVertical: 1,
        paddingHorizontal: 6,
        borderLeft: '4 solid #f97316',
        marginBottom: 1,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    col: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginRight: 4,
    },
    value: {
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    multilineValue: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        lineHeight: 1.1,
    },
    odontogramContainer: {
        marginTop: 2,
        border: '1 solid #E5E7EB',
        borderRadius: 8,
        padding: 5,
        backgroundColor: 'transparent',
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 3,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableCell: {
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 2,
        justifyContent: 'center',
    },
    tableCellHeader: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    tableCellValue: {
        fontSize: 7,
        textAlign: 'center',
    },
    verticalLabelContainer: {
        width: 25,
        borderRightWidth: 1,
        borderRightColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // New styles for Procedures/Payments tables
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#2A9D8F',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    rowEven: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    rowOdd: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    cellHeader: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#FFFFFF',
        padding: 4,
        textAlign: 'center',
    },
    cellValue: {
        fontSize: 7,
        padding: 3,
        textAlign: 'center',
    },
    cellValueLeft: {
        fontSize: 7,
        padding: 3,
        textAlign: 'left',
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: '#000',
    }
});

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
    } catch (e) {
        return dateStr;
    }
};

const ProcedimientosPage = ({ data }) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.backgroundImageContainer} fixed>
            <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
        </View>
        <View style={styles.header} fixed>
            <Image src="/pdf-header.jpg" style={styles.headerImage} />
        </View>

        <View style={{ marginBottom: 15, borderBottom: '1.5 solid #000', paddingBottom: 5 }}>
            <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', textDecoration: 'underline' }}>PROCEDIMIENTOS REALIZADOS</Text>
        </View>

        <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.label}>PACIENTE: <Text style={styles.value}>{data.nombre || ''}</Text></Text>
            <Text style={styles.label}>EDAD: <Text style={styles.value}>{data.edad || ''}</Text></Text>
        </View>

        {/* Brackets & Microtornillos Box */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15, alignItems: 'stretch' }}>
            <View style={{ flex: 1, border: '1 solid #000' }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderBottom: '1 solid #000' }}>
                    <View style={{ flex: 1.2, borderRight: '1 solid #000', padding: 3 }}><Text style={styles.tableCellHeader}>TIPO DE BRACKETTS</Text></View>
                    <View style={{ flex: 1, borderRight: '1 solid #000', padding: 3 }}><Text style={styles.tableCellHeader}>TÉCNICA:</Text></View>
                    <View style={{ flex: 1.5, borderRight: '1 solid #000', padding: 3 }}><Text style={styles.tableCellHeader}>OBJETIVO</Text></View>
                    <View style={{ flex: 1, padding: 3 }}><Text style={styles.tableCellHeader}>FORMA DE ARCO:</Text></View>
                </View>
                {(data.s16_proc_brackets_filas || []).map((bracket, bIdx) => (
                    <View key={bIdx} style={{ flexDirection: 'row', borderBottom: bIdx === (data.s16_proc_brackets_filas.length - 1) ? '0' : '1 solid #000' }}>
                        <View style={{ flex: 1.2, borderRight: '1 solid #000', padding: 3, minHeight: 15 }}><Text style={styles.tableCellValue}>{bracket.tipo || ''}</Text></View>
                        <View style={{ flex: 1, borderRight: '1 solid #000', padding: 3, minHeight: 15 }}><Text style={styles.tableCellValue}>{bracket.tecnica || ''}</Text></View>
                        <View style={{ flex: 1.5, borderRight: '1 solid #000', padding: 3, minHeight: 15 }}><Text style={styles.tableCellValue}>{bracket.objetivo || ''}</Text></View>
                        <View style={{ flex: 1, padding: 3, minHeight: 15 }}><Text style={styles.tableCellValue}>{bracket.forma_arco || ''}</Text></View>
                    </View>
                ))}
            </View>
            <View style={{ width: 100, border: '1 solid #000' }}>
                <View style={{ backgroundColor: 'transparent', borderBottom: '1 solid #000', padding: 3 }}><Text style={styles.tableCellHeader}>MICROTORNILLOS</Text></View>
                <View style={{ flex: 1, padding: 3, justifyContent: 'center' }}><Text style={styles.tableCellValue}>{data.s16_proc_microtornillos || ''}</Text></View>
            </View>
        </View>

        {/* Analisis Extraoral */}
        <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 8, backgroundColor: 'transparent', paddingVertical: 2 }}>ANALISIS EXTRAORAL</Text>

            <View style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Biotipo facial:</Text>
                        <Text style={styles.value}>{data.s16_proc_biotipo_facial || ''}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Simetría de la cara:</Text>
                        <Text style={styles.value}>{data.s16_proc_simetria_cara || ''}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 15, marginTop: 4 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Alineación:</Text>
                        <Text style={styles.value}>{data.s16_proc_alineacion || ''}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Perfil:</Text>
                        <Text style={styles.value}>{data.s16_proc_perfil || ''}</Text>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.label}>Tercio sup: <Text style={styles.value}>{data.s16_proc_tercio_sup || ''}</Text></Text>
                    <Text style={styles.label}>Tercio medio: <Text style={styles.value}>{data.s16_proc_tercio_medio || ''}</Text></Text>
                    <Text style={styles.label}>Tercio inf: <Text style={styles.value}>{data.s16_proc_tercio_inf || ''}</Text></Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.label}>Altura de Sonrisa: <Text style={styles.value}>{data.s16_proc_altura_sonrisa || ''}</Text></Text>
                    <Text style={styles.label}>Arco de Sonrisa: <Text style={styles.value}>{data.s16_proc_arco_sonrisa || ''}</Text></Text>
                    <Text style={styles.label}>Exp. Gingival(EG): <Text style={styles.value}>{data.s16_proc_exp_gingival || ''}</Text></Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.label}>Corredores bucales: <Text style={styles.value}>{data.s16_proc_corredores_bucales || ''}</Text></Text>
                </View>
            </View>

            <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.label}>Línea media dentaria:</Text>
                    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 1 }}>
                        <Text style={styles.value}>{data.s16_proc_linea_media_dentaria || ''}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.label}>Hábitos a corregir:</Text>
                    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 1 }}>
                        <Text style={styles.value}>{data.s16_proc_habitos || ''}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.label}>Alteraciones ATM:</Text>
                    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 1 }}>
                        <Text style={styles.value}>{data.s16_proc_alteraciones_atm || ''}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Adhesion Section */}
        <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 5 }}>ADHESIÓN DE BRACKETS</Text>

            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', fontSize: 8 }}>
                <Text style={styles.label}>REFERENCIA DE ADHESIÓN ARCO U ({data.s16_proc_adhesion_u_check ? 'X' : ' '})</Text>
                {[11, 12, 13, 14, 15, 16, 37].map(num => (
                    <Text key={num} style={{ marginLeft: 5 }}>{num} <Text style={{ borderBottom: '1 solid #000', minWidth: 15 }}>{data[`s16_proc_adhesion_u_${num}`] || '   '}</Text></Text>
                ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', fontSize: 8, marginTop: 4 }}>
                <Text style={styles.label}>REFERENCIA DE ADHESIÓN ARCO L ({data.s16_proc_adhesion_l_check ? 'X' : ' '})</Text>
                <Text style={{ marginLeft: 5 }}>41/42 <Text style={{ borderBottom: '1 solid #000', minWidth: 15 }}>{data.s16_proc_adhesion_l_41_42 || '   '}</Text></Text>
                {[43, 44, 45, 46, 47].map(num => (
                    <Text key={num} style={{ marginLeft: 5 }}>{num} <Text style={{ borderBottom: '1 solid #000', minWidth: 15 }}>{data[`s16_proc_adhesion_l_${num}`] || '   '}</Text></Text>
                ))}
            </View>
        </View>

        {/* Main Table */}
        <View style={{ border: '1 solid #000', position: 'relative' }}>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderBottom: '1 solid #000' }}>
                <View style={{ width: 30, borderRight: '1 solid #000', padding: 4 }}><Text style={styles.tableCellHeader}>Nro</Text></View>
                <View style={{ width: 60, borderRight: '1 solid #000', padding: 4 }}><Text style={styles.tableCellHeader}>FECHA</Text></View>
                <View style={{ flex: 1, borderRight: '1 solid #000', padding: 4 }}><Text style={styles.tableCellHeader}>PROCEDIMIENTO</Text></View>
                <View style={{ width: 60, borderRight: '1 solid #000', padding: 4 }}><Text style={styles.tableCellHeader}>LIGAS INTERM.</Text></View>
                <View style={{ width: 100, padding: 4 }}><Text style={styles.tableCellHeader}>OBSERVACIONES</Text></View>
            </View>
            {(data.s16_proc_filas || []).filter(row => row.fecha || row.mes || row.ligas_interm || row.observaciones).map((row, i, filteredArr) => (
                <View key={i} style={{ flexDirection: 'row', borderBottom: i === (filteredArr.length - 1) ? '0' : '1 solid #000' }} wrap={false}>
                    <View style={{ width: 30, borderRight: '1 solid #000', padding: 2, backgroundColor: 'transparent', minHeight: 12 }}><Text style={styles.tableCellValue}>{i + 1}</Text></View>
                    <View style={{ width: 60, borderRight: '1 solid #000', padding: 2, minHeight: 12 }}><Text style={styles.tableCellValue}>{formatDate(row.fecha)}</Text></View>
                    <View style={{ flex: 1, borderRight: '1 solid #000', padding: 2, minHeight: 12, textAlign: 'left' }}><Text style={{ fontSize: 7, textAlign: 'left' }}>{row.mes || ''}</Text></View>
                    <View style={{ width: 60, borderRight: '1 solid #000', padding: 2, minHeight: 12 }}><Text style={styles.tableCellValue}>{row.ligas_interm || ''}</Text></View>
                    <View style={{ width: 100, padding: 2, minHeight: 12 }}><Text style={{ fontSize: 7, textAlign: 'left' }}>{row.observaciones || ''}</Text></View>
                </View>
            ))}

        </View>

        <View style={{ marginTop: 10, border: '1 solid #000', padding: 5 }} wrap={false}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>REGISTRO FOTOGRÁFICO ({data.s16_proc_image1 || data.s16_proc_image2 ? 'Adjunto' : 'Sin adjuntar'}):</Text>
            <View style={{ flexDirection: 'row', gap: 10, height: 150 }}>
                <View style={{ flex: 1, border: '1 solid #E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                    {data.s16_proc_image1 ? (
                        <Image src={data.s16_proc_image1} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <Text style={{ fontSize: 8, color: '#9CA3AF' }}>Sin imagen izquierda</Text>
                    )}
                </View>
                <View style={{ flex: 1, border: '1 solid #E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                    {data.s16_proc_image2 ? (
                        <Image src={data.s16_proc_image2} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <Text style={{ fontSize: 8, color: '#9CA3AF' }}>Sin imagen derecha</Text>
                    )}
                </View>
            </View>
        </View>

        <View style={styles.footer} fixed>
            <Image src="/pdf-footer.jpg" style={styles.footerImage} />
        </View>
    </Page>
);

const RegistroPagoPage = ({ data }) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.backgroundImageContainer} fixed>
            <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
        </View>
        <View style={styles.header} fixed>
            <Image src="/pdf-header.jpg" style={styles.headerImage} />
        </View>

        <View style={{ marginBottom: 15, borderBottom: '2 solid #2A9D8F', paddingBottom: 5 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', color: '#1F2937' }}>REGISTRO DE PAGO POR TRATAMIENTO ORTODONCIA</Text>
        </View>

        <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '40%' }}><Text style={styles.label}>PACIENTE: <Text style={styles.value}>{data.nombre || ''}</Text></Text></View>
                <View style={{ width: '20%' }}><Text style={styles.label}>EDAD: <Text style={styles.value}>{data.edad || ''} a</Text></Text></View>
                <View style={{ width: '40%', textAlign: 'right' }}><Text style={styles.label}>FECHA: <Text style={styles.value}>{formatDate(data.s16_ppto_fecha)}</Text></Text></View>
            </View>

            <View style={{ marginBottom: 5 }}>
                <Text style={styles.label}>VALOR CORRESPONDIENTE POR TRATAMIENTO DE ORTODONCIA: <Text style={styles.value}>$ {data.s16_ppto_total_tratamiento || '_'}</Text></Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '60%' }}><Text style={styles.label}>TIEMPO ESTIMADO DE TRATAMIENTO: <Text style={styles.value}>{data.s16_ppto_tiempo_estimado || '_'}</Text> meses aproximadamente</Text></View>
                <View style={{ width: '40%' }}><Text style={styles.label}>CUOTA MENSUAL: $ <Text style={styles.value}>{data.s16_ppto_cuota_mensual || ''}</Text></Text></View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '55%' }}><Text style={styles.label}>COSTO DE BRACKETS NUEVO: $ <Text style={styles.value}>{data.s16_ppto_costo_brackets_nuevo || ''}</Text></Text></View>
                <View style={{ width: '45%' }}><Text style={styles.label}>Readhesion pasado los 6 meses: $ <Text style={styles.value}>{data.s16_ppto_readhesion || ''}</Text></Text></View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '100%', marginBottom: 3 }}><Text style={styles.label}>TRATAMIENTO CON EXTRACCIONES: <Text style={styles.value}>{data.s16_ppto_extracciones || '_______'}</Text></Text></View>
                <View style={{ width: '100%', marginBottom: 3 }}><Text style={styles.label}>CIRUGIA DE TERCEROS MOLARES: <Text style={styles.value}>{data.s16_ppto_cirugia_terceros || '________'}</Text></Text></View>
                <View style={{ width: '100%', marginBottom: 3 }}><Text style={styles.label}>CANINOS: <Text style={styles.value}>{data.s16_ppto_caninos || '___'}</Text></Text></View>
            </View>
        </View>

        <View style={styles.table}>
            <View style={styles.headerRow}>
                <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellHeader}>FECHA</Text></View>
                <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellHeader}>MES DE CONTROL</Text></View>
                <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellHeader}>VALOR</Text></View>
                <View style={[styles.borderRight, { width: 70 }]}><Text style={styles.cellHeader}>FORMA DE PAGO</Text></View>
                <View style={{ width: 60 }}><Text style={styles.cellHeader}>FIRMA</Text></View>
            </View>
            {(data.s16_ppto_pagos_filas || []).filter(row => row.fecha || row.mes || row.valor || row.forma_pago).map((row, i) => (
                <View key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd} wrap={false}>
                    <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellValue}>{formatDate(row.fecha)}</Text></View>
                    <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellValueLeft}>{row.mes || ''}</Text></View>
                    <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellValue}>{row.valor || ''}</Text></View>
                    <View style={[styles.borderRight, { width: 70 }]}><Text style={styles.cellValueLeft}>{row.forma_pago || ''}</Text></View>
                </View>
            ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: -1 }}>
            <View style={{ width: 80 }}></View>
            <View style={{ flex: 1, padding: 2, borderBottom: '1 solid #000', borderLeft: '1 solid #000', borderRight: '1 solid #000' }}>
                <Text style={{ textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 7 }}>TOTAL</Text>
            </View>
            <View style={{ width: 50, padding: 2, borderBottom: '1 solid #000', borderRight: '1 solid #000' }}>
                <Text style={{ textAlign: 'center', fontSize: 7 }}>{data.s16_ppto_total_general || ''}</Text>
            </View>
            <View style={{ width: 70 }}></View>
            <View style={{ width: 60 }}></View>
        </View>

        {/* COSTO ADICIONAL POR PERDIDA DE BRACKETS- TUBOS */}
        <View style={{ marginTop: 10 }}>
            <View style={{ backgroundColor: 'transparent', padding: 2, border: '1 solid #000', borderBottom: 0 }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>COSTO ADICIONAL POR PERDIDA DE BRACKETS- TUBOS</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellHeader}>FECHA</Text></View>
                    <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellHeader}>DESCRIPCION</Text></View>
                    <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellHeader}>VALOR</Text></View>
                    <View style={{ width: 60 }}><Text style={styles.cellHeader}>FIRMA</Text></View>
                </View>
                {(data.s16_ppto_perdida_filas || []).filter(row => row.fecha || row.mes || row.valor).map((row, i) => (
                    <View key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd} wrap={false}>
                        <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellValue}>{formatDate(row.fecha)}</Text></View>
                        <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellValueLeft}>{row.mes || ''}</Text></View>
                        <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellValue}>{row.valor || ''}</Text></View>
                        <View style={{ width: 60 }}><Text style={styles.cellValue}></Text></View>
                    </View>
                ))}
            </View>
        </View>

        {/* READHESION DE BRACKETS */}
        <View style={{ marginTop: 10 }}>
            <View style={{ backgroundColor: 'transparent', padding: 2, border: '1 solid #000', borderBottom: 0 }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>READHESION DE BRACKETS</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellHeader}>FECHA</Text></View>
                    <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellHeader}>DESCRIPCION</Text></View>
                    <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellHeader}>VALOR</Text></View>
                    <View style={{ width: 60 }}><Text style={styles.cellHeader}>FIRMA</Text></View>
                </View>
                {(data.s16_ppto_readhesion_filas || []).filter(row => row.fecha || row.mes || row.valor).map((row, i) => (
                    <View key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd} wrap={false}>
                        <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellValue}>{formatDate(row.fecha)}</Text></View>
                        <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellValueLeft}>{row.mes || ''}</Text></View>
                        <View style={[styles.borderRight, { width: 50 }]}><Text style={styles.cellValue}>{row.valor || ''}</Text></View>
                        <View style={{ width: 60 }}><Text style={styles.cellValue}></Text></View>
                    </View>
                ))}
            </View>
        </View>

        <View style={{ marginTop: 10, border: '1 solid #000', padding: 8 }}>
            <Text style={styles.label}>NOTA: <Text style={styles.value}>{data.s16_ppto_aparato_footer || ''}</Text></Text>
        </View>

        <View style={styles.footer} fixed>
            <Image src="/pdf-footer.jpg" style={styles.footerImage} />
        </View>
    </Page>
);

const RegistroPagoCirugiaPage = ({ data }) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.backgroundImageContainer} fixed>
            <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
        </View>
        <View style={styles.header} fixed>
            <Image src="/pdf-header.jpg" style={styles.headerImage} />
        </View>

        <View style={{ marginBottom: 15, borderBottom: '2 solid #2A9D8F', paddingBottom: 5 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', color: '#1F2937' }}>REGISTRO DE PAGO POR TRATAMIENTO ORTODONCIA Y CIRUGIA</Text>
        </View>

        <View style={{ marginBottom: 10, flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}><Text style={styles.label}>PACIENTE: <Text style={styles.value}>{data.nombre || ''}</Text></Text></View>
            <View style={{ width: 120 }}><Text style={styles.label}>FECHA: <Text style={styles.value}>{formatDate(data.s16_ppto_cirugia_fecha)}</Text></Text></View>
        </View>

        <View style={{ marginBottom: 10 }}>
            <View style={{ marginBottom: 5 }}>
                <Text style={styles.label}>VALOR CORRESPONDIENTE POR TRATAMIENTO DE ORTODONCIA: <Text style={styles.value}>$ {data.s16_ppto_cirugia_total_tratamiento || '_'}</Text></Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '60%' }}><Text style={styles.label}>TIEMPO ESTIMADO DE TRATAMIENTO: <Text style={styles.value}>{data.s16_ppto_cirugia_tiempo_estimado || '_'}</Text></Text></View>
                <View style={{ width: '40%' }}><Text style={styles.label}>CUOTA MENSUAL: $ <Text style={styles.value}>{data.s16_ppto_cirugia_cuota_mensual || ''}</Text></Text></View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ width: '55%' }}><Text style={styles.label}>COSTO DE BRACKETS NUEVO: $ <Text style={styles.value}>{data.s16_ppto_cirugia_costo_brackets_nuevo || ''}</Text></Text></View>
                <View style={{ width: '45%' }}><Text style={styles.label}>READHESION PASADO LOS 6 MESES: $ <Text style={styles.value}>{data.s16_ppto_cirugia_readhesion || ''}</Text></Text></View>
            </View>
        </View>

        <View style={styles.table}>
            <View style={styles.headerRow}>
                <View style={[styles.borderRight, { width: 30 }]}><Text style={styles.cellHeader}>N°</Text></View>
                <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellHeader}>FECHA</Text></View>
                <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellHeader}>MES DE CONTROL</Text></View>
                <View style={[styles.borderRight, { width: 100 }]}><Text style={styles.cellHeader}>VALOR</Text></View>
                <View style={{ width: 80 }}><Text style={styles.cellHeader}>FIRMA</Text></View>
            </View>
            {(data.s16_ppto_cirugia_pagos_filas || []).filter(row => row.fecha || row.mes || row.valor).map((row, i) => (
                <View key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd} wrap={false}>
                    <View style={[styles.borderRight, { width: 30 }]}><Text style={styles.cellValue}>{i + 1}</Text></View>
                    <View style={[styles.borderRight, { width: 80 }]}><Text style={styles.cellValue}>{formatDate(row.fecha)}</Text></View>
                    <View style={[styles.borderRight, { flex: 1 }]}><Text style={styles.cellValueLeft}>{row.mes || ''}</Text></View>
                    <View style={[styles.borderRight, { width: 100 }]}><Text style={styles.cellValue}>{row.valor || ''}</Text></View>
                    <View style={{ width: 80 }}><Text style={styles.cellValue}></Text></View>
                </View>
            ))}
        </View>

        <View style={{ marginTop: 10, border: '1 solid #000', padding: 8 }}>
            <Text style={styles.label}>NOTA: <Text style={styles.value}>{data.s16_ppto_cirugia_aparato_footer || ''}</Text></Text>
        </View>

        <View style={styles.footer} fixed>
            <Image src="/pdf-footer.jpg" style={styles.footerImage} />
        </View>
    </Page>
);

const ConsentimientoPage = ({ data }) => {
    const today = new Date();
    const day = today.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    const RenderCheckSquare = (label, checked) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <Text style={{ fontSize: 9.5, marginRight: 5 }}>{label}</Text>
            <View style={{ width: 22, height: 18, border: '1 solid #000', justifyContent: 'center', alignItems: 'center' }}>
                {checked && <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>X</Text>}
            </View>
        </View>
    );

    return (
        <Page size="A4" style={[styles.page, { paddingHorizontal: 50, paddingTop: 100, paddingBottom: 90 }]}>
            <View style={styles.backgroundImageContainer} fixed>
                <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
            </View>
            <View style={styles.header} fixed>
                <Image src="/pdf-header.jpg" style={styles.headerImage} />
            </View>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', color: '#000', textTransform: 'uppercase' }}>
                    CONSENTIMIENTO PARA REALIZAR TRATAMIENTO DE ORTODONCIA
                </Text>
            </View>

            <View style={{ marginBottom: 12, alignItems: 'flex-end', paddingRight: 10 }}>
                <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica' }}>Loja, {day} de {month} {year}</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 9, lineHeight: 1.5, textAlign: 'justify', color: '#000' }}>
                    Yo <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>{data.s16_consent_representante || '_____________________________________________________'}</Text> (como paciente) y/o como representante legal de <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>{data.s16_consent_paciente || '________________________________________________'}</Text>, con C.I. No. <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>{data.s16_consent_ci || '________________'}</Text>, mayor de edad, <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>{data.s16_consent_edad || '______'}</Text> años. <Text style={{ fontFamily: 'Helvetica-Bold' }}>DECLARO</Text> Que la Dra. Diana Rodríguez me ha explicado que es conveniente en mi situación proceder a realizar un tratamiento ortodóntico, con objeto de conseguir una mejor alineación de los dientes, para de esta manera prevenir problemas posteriores, mejorando a la vez la masticación y la estética. Para ello se emplean aparatos de ortodoncia que pueden ser removibles o fijos. Se que es posible que los aparatos removibles (retenedor) y fijos (brackets) se pierdan fácilmente si no están en la boca, y que en este caso el costo de reposición correrá por mi cuenta.
                </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 9, lineHeight: 1.5, textAlign: 'justify', color: '#000' }}>
                    La Dentista me ha explicado que los aparatos pueden producir úlceras o llagas, dolor en los dientes que están con los aparatos ortodónticos (Brackets) y que es frecuente que con el tiempo se produzca reabsorción de las raíces, de manera que estas queden más pequeñas, así como la disminución de las encías, que pueden requerir tratamiento posterior (especialista indicado Periodoncista). También me ha explicado que el tratamiento puede requerir la extracción de algún o algunos dientes sanos, incluso puede ser necesario la extracción de las muelas del juicio, cuyo costo adicional no se incluye en el tratamiento de Ortodoncia. El tratamiento ortodóntico puede ser largo en el tiempo, meses e incluso años, lo que no depende solo de la técnica empleada ni de su correcta realización, sino también de factores generalmente biológicos, y de la respuesta de mi organismo, totalmente impredecibles, y que durante todo este tiempo deberé acudir a las consultas indicadas y extremar las medidas de higiene de la boca, para evitar caries y enfermedad de las encías. La Dentista me ha explicado que suspenderá el tratamiento si la higiene no es la adecuada, porque corre gran riesgo mi dentición de sufrir lesiones cariosas múltiples u otros padecimientos derivados de la escasez de higiene oral. Asimismo, me ha informado que, tras la conclusión del tratamiento, se pueden producir algunos movimientos dentarios no deseados y que deberé acudir periódicamente para su revisión y evitar recidivas. He comprendido lo explicado de forma clara, con un lenguaje sencillo, habiendo resuelto todas las dudas que se me han planteado, y la información complementaria que he solicitado.
                </Text>
            </View>

            <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Indicaciones específicas:</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                {[
                    'Para iniciar el tratamiento de ortodoncia, la boca tiene que estar sana y los dientes sin caries.',
                    'El tratamiento de Ortodoncia, no incluye extracción de terceros molares (Dientes del juicio), u otros dientes.',
                    'Con el tiempo se pueden despegar los brackets por varias causas, como la mala mordida, se acomoda mal el alimento, se muerde alimentos duros, pegajosos etc, por lo que se re adhiere el bracket sin costo hasta los 6 meses, pasado ese tiempo tiene un costo adicional de $ 10.',
                    'En caso de pérdida de brackets, el repuesto tiene un costo adicional de $ 20.',
                    'AL final del tratamiento se colocan retenedores, para mantener los dientes en la posición final, por lo que queda a responsabilidad del paciente el cuidado e higiene del mismo.',
                    'El costo de tratamiento de ortodoncia solo incluye el tratamiento mencionado, en caso de necesitar otra especialidad como Rehabilitación Oral, Endodoncista etc., no se incluye en el costo del tratamiento de ortodoncia',
                    'La limpieza dental se recomienda cada 6 meses no se incluye en el tratamiento de ortodoncia.',
                    'En caso de no acudir a las citas mensualmente o en la fecha indicada se extiende la duración del tratamiento de ortodoncia.',
                    'Pasado 5 meses, si el paciente no acude a los controles ya no nos responsabilizamos por el tratamiento, puesto que se pueden presentar movimientos indeseados en los dientes, e inicio de caries'
                ].map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 2.5, paddingLeft: 10 }}>
                        <Text style={{ fontSize: 9, marginRight: 5 }}>-</Text>
                        <Text style={{ fontSize: 9, lineHeight: 1.3, flex: 1 }}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, lineHeight: 1.5, textAlign: 'justify', color: '#000' }}>
                    Por la presente, manifiesto que acepto el costo del tratamiento de ortodoncia por un valor de $ <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}> {data.s16_consent_costo_total || '1,000'} </Text>, con controles mensuales por un valor de $ <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}> {data.s16_consent_costo_mensual || '53'} </Text>, (valor de referencia hasta completar el valor total de tratamiento de Ortodoncia), el tratamiento se realizará con Brackets metálico de autoligado, por un tiempo estimado no exacto de <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}> {data.s16_consent_tiempo_estimado || '15'} </Text> meses, y doy mi <Text style={{ fontFamily: 'Helvetica-Bold' }}>consentimiento para la toma de los registros de diagnóstico</Text>, que incluyen: historia Clínica, radiografías, toma de impresiones y registro Fotográfico antes, durante y después del tratamiento de ortodoncia, autorizando a la(s) Dentista(s) mencionado(s) anteriormente, y donde corresponda, a Tratarme ortodónticamente.
                </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15 }}>
                {RenderCheckSquare('SI', data.s16_consent_acepta_tratamiento === true)}
                {RenderCheckSquare('NO', data.s16_consent_acepta_tratamiento === false)}
            </View>

            <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }}>CONSENTIMIENTO PARA USAR LOS REGISTROS DIAGNÓSTICOS</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, lineHeight: 1.5, textAlign: 'justify', color: '#000' }}>
                    Por la presente, autorizo a la Dentista, a suministrar información referida al cuidado de ortodoncia en el proceso de exámenes, tratamiento y retención arriba mencionado, según corresponda. Entiendo que una vez divulgada, el personal no tendrá responsabilidad alguna por cualquier divulgación en el futuro hecha por la persona que reciba esta información, para el propósito de consultas profesionales, investigación, educación o publicación en revistas profesionales.
                </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15 }}>
                {RenderCheckSquare('SI', data.s16_consent_acepta_uso_registros === true)}
                {RenderCheckSquare('NO', data.s16_consent_acepta_uso_registros === false)}
            </View>

            <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>
                    Estoy satisfecho/a con la información recibida y comprendido el alcance y riesgos de este tratamiento, por ello, <Text style={{ textDecoration: 'underline' }}>DOY MI CONSENTIMIENTO</Text>, para iniciar el tratamiento de ortodoncia.
                </Text>
            </View>

            <View style={{ marginTop: 15, flexDirection: 'row' }}>
                <View style={{ flex: 1, paddingRight: 30 }}>
                    <View style={{ borderBottom: '1 solid #000', height: 20, marginBottom: 5, justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica' }}>Dra. Diana Rodríguez</Text>
                    </View>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Dentista.</Text>
                    <View style={{ borderBottom: '1 solid #000', height: 20, width: 100, marginBottom: 5 }} />
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Sello</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', borderBottom: '1 solid #000', paddingBottom: 2, marginBottom: 5 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Paciente o Representante</Text>
                        <Text style={{ fontSize: 9, marginLeft: 5 }}>{data.s16_consent_representante || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', borderBottom: '1 solid #000', paddingBottom: 2, marginBottom: 5 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Pasaporte/C.I.</Text>
                        <Text style={{ fontSize: 9, marginLeft: 5 }}>{data.s16_consent_ci || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', borderBottom: '1 solid #000', paddingBottom: 2 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Correo:</Text>
                        <Text style={{ fontSize: 9, marginLeft: 5 }}>{data.s16_consent_correo || ''}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer} fixed>
                <Image src="/pdf-footer.jpg" style={styles.footerImage} />
            </View>
        </Page>
    );
};

const COLORS = {
    caries: '#D00000',
    sellante_nec: '#D00000',
    endodoncia: '#D00000',
    obturado: '#0066FF',
    sellante_realizado: '#0066FF',
    endodoncia_real: '#0066FF',
    corona: '#0066FF',
    prot_total: '#0066FF',
    removible: '#0066FF',
    fija: '#0066FF',
    implante: '#059669',
    perdida_caries: '#0066FF',
    perdida_otra: '#0066FF',
};

const SYMBOLS = {
    caries: 'O',
    sellante_nec: '*',
    endodoncia: '△',
    obturado: 'O',
    sellante_realizado: '*',
    endodoncia_real: '△',
    prot_total: '===',
    removible: '(---)',
    fija: '[--]',
    perdida_otra: '⊗',
    corona: '▣',
};

const Tooth5PartsPDF = ({ id, data = {}, isCircle = false, size = 24 }) => {
    const getFill = (part) => {
        const val = data[part];
        return COLORS[val] || '#FFFFFF';
    };

    const status = data.status || 'normal';
    const isAbsent = ['ausente', 'perdida_caries', 'perdida_otra', 'extraccion_ind'].includes(status);
    const sColor = status.includes('corona') ? '#FBBF24' : '#000000';
    const sWidth = 0.8;
    const scale = size / 100;

    const renderSymbol = (part, cx, cy) => {
        const pStatus = data[part];
        if (!pStatus || !SYMBOLS[pStatus]) return null;
        return (
            <Text
                x={cx}
                y={cy + (isCircle ? 1 : 1)}
                style={{
                    fontSize: isCircle ? 14 : 16,
                    fontFamily: 'Helvetica-Bold',
                    fill: '#FFFFFF',
                    textAlign: 'center'
                }}
            >
                {SYMBOLS[pStatus]}
            </Text>
        );
    };

    if (isCircle) {
        return (
            <G transform={`scale(${scale})`}>
                <Path d="M 50 50 L 20 20 A 42 42 0 0 1 80 20 Z" fill={getFill('top')} stroke={sColor} strokeWidth={sWidth} />
                <Path d="M 50 50 L 80 80 A 42 42 0 0 1 20 80 Z" fill={getFill('bottom')} stroke={sColor} strokeWidth={sWidth} />
                <Path d="M 50 50 L 20 80 A 42 42 0 0 1 20 20 Z" fill={getFill('left')} stroke={sColor} strokeWidth={sWidth} />
                <Path d="M 50 50 L 80 20 A 42 42 0 0 1 80 80 Z" fill={getFill('right')} stroke={sColor} strokeWidth={sWidth} />
                <Circle cx="50" cy="50" r="20" fill={getFill('center')} stroke={sColor} strokeWidth={sWidth} />
                {renderSymbol('top', 42, 12)}
                {renderSymbol('bottom', 42, 82)}
                {renderSymbol('left', 8, 45)}
                {renderSymbol('right', 78, 45)}
                {renderSymbol('center', 42, 45)}
                {isAbsent && <Line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth={5} />}
                {(status === 'prot_total' || status === 'removible' || status === 'fija') && (
                    <Text x="50" y="55" style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', fill: '#0066FF', textAlign: 'center' }}>
                        {SYMBOLS[status]}
                    </Text>
                )}
            </G>
        );
    }

    return (
        <G transform={`scale(${scale})`}>
            <Path d="M 0 0 L 100 0 L 75 25 L 25 25 Z" fill={getFill('top')} stroke={sColor} strokeWidth={sWidth} />
            <Path d="M 0 100 L 100 100 L 75 75 L 25 75 Z" fill={getFill('bottom')} stroke={sColor} strokeWidth={sWidth} />
            <Path d="M 0 0 L 0 100 L 25 75 L 25 25 Z" fill={getFill('left')} stroke={sColor} strokeWidth={sWidth} />
            <Path d="M 100 0 L 100 100 L 75 75 L 75 25 Z" fill={getFill('right')} stroke={sColor} strokeWidth={sWidth} />
            <Rect x="25" y="25" width="50" height="50" fill={getFill('center')} stroke={sColor} strokeWidth={sWidth} />
            {renderSymbol('top', 42, 10)}
            {renderSymbol('bottom', 42, 85)}
            {renderSymbol('left', 6, 45)}
            {renderSymbol('right', 82, 45)}
            {renderSymbol('center', 42, 45)}
            {isAbsent && <Line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth={5} />}
            {status === 'implante' && <Text x="35" y="75" style={{ fontSize: 50, fontFamily: 'Helvetica-Bold', fill: '#059669' }}>I</Text>}
            {(status === 'prot_total' || status === 'removible' || status === 'fija') && (
                <Text x="50" y="60" style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', fill: '#0066FF', textAlign: 'center' }}>
                    {SYMBOLS[status]}
                </Text>
            )}
        </G>
    );
};

const OrtodonciaDocument = ({ data = {}, mode = 1 }) => {
    if (mode === 2) return <Document><ProcedimientosPage data={data} /></Document>;
    if (mode === 3) return <Document><RegistroPagoPage data={data} /></Document>;
    if (mode === 4) return <Document><RegistroPagoCirugiaPage data={data} /></Document>;
    if (mode === 5) return <Document><ConsentimientoPage data={data} /></Document>;
    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/-/g, "").replace(/\s+/g, "").trim();
    const odontograma = data.odontograma || {};

    const renderToothBlock = (id, x, y, isCircle = false, reverse = false, hideRM = false) => {
        const toothData = odontograma[id.toString()] || {};
        const rVal = toothData.recesion;
        const mVal = toothData.movilidad;
        return (
            <G transform={`translate(${x}, ${y})`}>
                {!reverse ? (
                    <>
                        {!hideRM && (
                            <>
                                <Rect x="0" y="0" width="14" height="10" stroke="#000" strokeWidth={0.5} fill="#fff" />
                                <Text x="7" y="7.5" style={{ fontSize: 7, fill: '#000000' }} textAnchor="middle">{rVal || ''}</Text>
                                <Rect x="0" y="11" width="14" height="10" stroke="#000" strokeWidth={0.5} fill="#fff" />
                                <Text x="7" y="18.5" style={{ fontSize: 7, fill: '#000000' }} textAnchor="middle">{mVal || ''}</Text>
                            </>
                        )}
                        <Text x="7" y={hideRM ? 6 : 29} style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', fill: '#64748b' }} textAnchor="middle">{id}</Text>
                        <G transform={`translate(0, ${hideRM ? 8 : 34})`}>
                            <Tooth5PartsPDF id={id} data={toothData} isCircle={isCircle} size={20} />
                        </G>
                    </>
                ) : (
                    <>
                        <G transform="translate(0, 0)">
                            <Tooth5PartsPDF id={id} data={toothData} isCircle={isCircle} size={20} />
                        </G>
                        <Text x="7" y="28" style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', fill: '#64748b' }} textAnchor="middle">{id}</Text>
                        {!hideRM && (
                            <>
                                <Rect x="0" y="32" width="14" height="10" stroke="#000" strokeWidth={0.5} fill="#fff" />
                                <Text x="7" y="39.5" style={{ fontSize: 7, fill: '#000000' }} textAnchor="middle">{mVal || ''}</Text>
                                <Rect x="0" y="43" width="14" height="10" stroke="#000" strokeWidth={0.5} fill="#fff" />
                                <Text x="7" y="50.5" style={{ fontSize: 7, fill: '#000000' }} textAnchor="middle">{rVal || ''}</Text>
                            </>
                        )}
                    </>
                )}
            </G>
        );
        return ids.map((id, i) => (
            <G key={id}>{renderToothBlock(id, startX + (i * 28), startY, isCircle, reverse, hideRM)}</G>
        ));
    };

    const RenderRadio = (label, checked, fontSize = 9) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 15 }}>
            <View style={{
                width: 10, height: 10, borderRadius: 5,
                border: checked ? '1.5 solid #2A9D8F' : '1 solid #000',
                backgroundColor: checked ? '#2A9D8F' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {checked && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' }} />}
            </View>
            <Text style={{ fontSize, fontFamily: checked ? 'Helvetica-Bold' : 'Helvetica' }}>{label}</Text>
        </View>
    );

    const RenderCheck = (label, isSelected) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 15, marginBottom: 2 }}>
            <View style={{
                width: 11, height: 11,
                border: isSelected ? '1.5 solid #2A9D8F' : '1 solid #000',
                backgroundColor: isSelected ? '#2A9D8F' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {isSelected && <Text style={{ color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold' }}>X</Text>}
            </View>
            <Text style={{ fontSize: 9 }}>{label}</Text>
        </View>
    );

    const face = data.analisis_facial || {};

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.backgroundImageContainer} fixed>
                    <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
                </View>
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                {/* Section 1: ANALYSIS GENERAL / ANAMNESIS */}
                <View style={[styles.section, { marginTop: 0 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderBottom: '2 solid #2A9D8F', paddingBottom: 4 }}>
                        <View style={{
                            width: 22, height: 22, borderRadius: 11, backgroundColor: '#2A9D8F',
                            justifyContent: 'center', alignItems: 'center', marginRight: 10
                        }}>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }}>1</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#1F2937' }}>ANÁLISIS GENERAL/ANAMNESIS</Text>
                    </View>

                    <View style={{ marginLeft: 5, gap: 4 }}>
                        {/* 1.1 - 1.3 Personal Data */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 100 }}>1.1. Nombre del paciente</Text>
                            <View style={{ flex: 1 }}><Text style={{ fontSize: 9 }}>{data.nombre || ''}</Text></View>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginHorizontal: 6 }}>Edad</Text>
                            <View style={{ width: 30 }}><Text style={{ fontSize: 9, textAlign: 'center' }}>{data.edad || ''}</Text></View>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginHorizontal: 6 }}>C.I.</Text>
                            <View style={{ width: 70 }}><Text style={{ fontSize: 9, textAlign: 'center' }}>{data.cedula || ''}</Text></View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 100 }}>1.2. País y ciudad</Text>
                            <View style={{ flex: 1 }}><Text style={{ fontSize: 9 }}>{data.pais_ciudad || ''}</Text></View>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginHorizontal: 6 }}>Sexo</Text>
                            <View style={{ width: 60 }}><Text style={{ fontSize: 9, textAlign: 'center' }}>{data.sexo || ''}</Text></View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 100 }}>1.3. Tutor</Text>
                            <View style={{ flex: 1 }}><Text style={{ fontSize: 9 }}>{data.tutor || ''}</Text></View>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginHorizontal: 6 }}>Celular</Text>
                            <View style={{ width: 80 }}><Text style={{ fontSize: 9, textAlign: 'center' }}>{data.celular || ''}</Text></View>
                        </View>

                        {/* 1.4 - 1.6 Large Text boxes */}
                        {[
                            { id: '1.4', l: '1.4 Queja principal:', v: data.queja_principal },
                            { id: '1.5', l: '1.5 Historia médica:', v: data.historia_medica },
                            { id: '1.6', l: '1.6 Accidentes/Traumas:', v: data.historico_accidentes }
                        ].map(item => (
                            <View key={item.id} style={{ borderBottom: '1 solid #000', paddingVertical: 4 }}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{item.l}</Text>
                                <Text style={{ fontSize: 9, marginLeft: 10 }}>{item.v || '—'}</Text>
                            </View>
                        ))}

                        {/* 1.7 - 1.9 Radio rows */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 160 }}>1.7 ¿Tratamiento previo?</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {RenderRadio('Si', data.tratamiento_previo === 'Si')}
                                {RenderRadio('No', data.tratamiento_previo === 'No')}
                            </View>
                            <View style={{ flex: 1, marginLeft: 15, borderLeft: '0.5 solid #DDD', paddingLeft: 10 }}>
                                <Text style={{ fontSize: 7, color: '#4B5563' }}>Detalle: {data.tratamiento_previo_detalle || '—'}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 140 }}>1.8 Colaboración:</Text>
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                {RenderRadio('Alto', data.indice_colaboracion === 'Alto')}
                                {RenderRadio('Medio', data.indice_colaboracion === 'Medio')}
                                {RenderRadio('Bajo', data.indice_colaboracion === 'Bajo')}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', width: 140 }}>1.9 Higiene:</Text>
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                {RenderRadio('Adecuada', data.higiene_oral === 'Adecuada')}
                                {RenderRadio('Deficiente', data.higiene_oral === 'Deficiente')}
                            </View>
                        </View>

                        <View style={{ borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>1.10 Nec. Tratamiento Gral:</Text>
                            <Text style={{ fontSize: 9, marginLeft: 10 }}>{data.necesidad_tratamiento_general || '—'}</Text>
                        </View>
                        <View style={{ borderBottom: '1 solid #000', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>1.11 Hereditariedad:</Text>
                            <Text style={{ fontSize: 9, marginLeft: 10 }}>{data.hereditariedad || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 2: ANÁLISIS FACIAL */}
                <View style={[styles.section, { marginTop: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #2A9D8F', paddingBottom: 4 }}>
                        <View style={{
                            width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F',
                            justifyContent: 'center', alignItems: 'center', marginRight: 10
                        }}>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }}>2</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#1F2937' }}>ANÁLISIS FACIAL</Text>
                    </View>

                    <View style={{ marginLeft: 5 }}>
                        {[
                            { id: 'tipo_facial', n: '2.1', l: 'TIPO FACIAL:', os: ['Mesofacial', 'Dolicofacial', 'Braquifacial'] },
                            { id: 'convexidad_facial', n: '2.2', l: 'CONVEXIDAD FACIAL:', os: ['Recto', 'Cóncavo', 'Convexo'] },
                            { id: 'proporcion_tercios', n: '2.3', l: 'PROPORCIÓN DE LOS TERCIOS FACIALES:', os: ['Proporcionales', 'S.P. Aumentados', 'S.P. Diminuídos'], isComplex: true },
                            { id: 'sellado_labial', n: '2.4', l: 'SELLADO LABIAL:', os: ['Pasivo', 'Comprensivo'] },
                            { id: 'relacion_labios', n: '2.5', l: 'RELACIÓN ANTERO-POSTERIOR DE LÁBIOS:', os: ['Superior delante del inferior', 'Inferior delante del labio superior'], isLong: true },
                            { id: 'simetria_reposo', n: '2.6', l: 'SIMETRÍA FACIAL EN REPOSO:', isSimetry: true },
                            { id: 'simetria_apertura', n: '2.7', l: 'SIMETRÍA FACIAL EN APERTURA BUCAL:', isSimetry: true },
                            { id: 'angulo_nasolabial', n: '2.8', l: 'ÁNGULO NASOLABIAL:', os: ['Normal', 'Abierto', 'Disminuido'] },
                            { id: 'surco_mentolabial', n: '2.9', l: 'SURCO MENTOLABIAL:', os: ['Normal', 'Profundo', 'Poco Profundo'] },
                            { id: 'proyeccion_cigomatica', n: '2.10', l: 'PROYECCIÓN CIGOMÁTICA:', os: ['Normal', 'Aumentada', 'Deficiente'] },
                            { id: 'linea_menton_cuello', n: '2.11', l: 'LÍNEA MENTÓN-CUELLO:', os: ['Normal', 'Aumentada', 'Disminuida'] },
                            { id: 'angulo_menton_cuello', n: '2.12', l: 'ÁNGULO MENTÓN-CUELLO:', os: ['Normal', 'Abierto', 'Cerrado'] }
                        ].map(field => (
                            <View key={field.id} style={{ borderBottom: '1.2 solid #000', paddingVertical: 10 }} wrap={false}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>{field.n} {field.l}</Text>

                                {field.isSimetry ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 15 }}>
                                        <View style={{ gap: 6, width: 220 }}>
                                            {field.id === 'simetria_reposo' ? (
                                                <>
                                                    {RenderRadio('Paciente simétrico', face.simetria_reposo?.estado === 'Simetrico', 9)}
                                                    {RenderRadio('Paciente asimétrico', face.simetria_reposo?.estado === 'Asimetrico', 9)}
                                                </>
                                            ) : (
                                                <>
                                                    {RenderRadio('Presenta', face.simetria_apertura?.estado === 'Presenta', 9)}
                                                    {RenderRadio('No presenta', face.simetria_apertura?.estado === 'No presenta', 9)}
                                                </>
                                            )}
                                        </View>
                                        <View style={{ gap: 6, borderLeft: '1 solid #000', paddingLeft: 20 }}>
                                            {RenderCheck('Desviación hacia la derecha', face[field.id]?.derecha)}
                                            {RenderCheck('Desviación hacia la izquierda', face[field.id]?.izquierda)}
                                        </View>
                                    </View>
                                ) : field.isComplex ? (
                                    <View style={{ paddingLeft: 15 }}>
                                        <View style={{ flexDirection: 'row', gap: 30, marginBottom: 7 }}>
                                            {field.os.map(o => {
                                                const val = o === 'S.P. Aumentados' ? 'Sin proporcion aumentados' : o === 'S.P. Diminuídos' ? 'Sin proporcion disminuido' : o;
                                                return RenderRadio(o, face.proporcion_tercios?.estado === val);
                                            })}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 35, paddingLeft: 10 }}>
                                            {RenderCheck('Superior', face.proporcion_tercios?.superior)}
                                            {RenderCheck('Inferior', face.proporcion_tercios?.inferior)}
                                            {RenderCheck('Medio', face.proporcion_tercios?.medio)}
                                        </View>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', gap: 40, paddingLeft: 15 }}>
                                        {field.os.map(o => {
                                            const val = field.id === 'relacion_labios' ? (o === 'Superior delante del inferior' ? 'Superior delante' : 'Inferior delante') : (o === 'Cóncavo' ? 'Concavo' : o);
                                            return RenderRadio(o, face[field.id] === val);
                                        })}
                                    </View>
                                )}
                            </View>
                        ))}

                        {/* 2.13 Patron Facial - High Contrast block */}
                        <View style={{ marginTop: 12, paddingBottom: 20 }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 10 }}>2.13. PATRÓN FACIAL:</Text>
                            <View style={{ gap: 12, paddingLeft: 15 }}>
                                <View style={{ flexDirection: 'row', gap: 50, borderBottom: '1 solid #000', paddingBottom: 8 }}>
                                    {RenderRadio('Patrón I', face.patron_facial?.tipo === 'Patron I')}
                                    {RenderRadio('Cara Corta', face.patron_facial?.tipo === 'Cara Corta')}
                                    {RenderRadio('Cara Larga', face.patron_facial?.tipo === 'Cara Larga')}
                                </View>

                                <View style={{ borderBottom: '1 solid #000', paddingBottom: 10 }} wrap={false}>
                                    {RenderRadio('Patrón II', face.patron_facial?.tipo === 'Patron II')}
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 7, paddingLeft: 15 }}>
                                        {RenderCheck('Retrusión Mandibular', face.patron_facial?.p2_retrusion_mand)}
                                        {RenderCheck('Protrusión Maxilar', face.patron_facial?.p2_protrusion_max)}
                                        {RenderCheck('Aumento AFAI', face.patron_facial?.p2_aumento_afai)}
                                        {RenderCheck('AFAI Disminuida', face.patron_facial?.p2_disminucion_afai)}
                                    </View>
                                </View>

                                <View wrap={false}>
                                    {RenderRadio('Patrón III', face.patron_facial?.tipo === 'Patron III')}
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 7, paddingLeft: 15 }}>
                                        {RenderCheck('Protrusión Mandibular', face.patron_facial?.p3_protrusion_mand)}
                                        {RenderCheck('Retrusión Maxilar', face.patron_facial?.p3_retrusion_max)}
                                        {RenderCheck('Aumento AFAI', face.patron_facial?.p3_aumento_afai)}
                                        {RenderCheck('AFAI Disminuida', face.patron_facial?.p3_disminucion_afai)}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 3: ANÁLISIS OCLUSAL */}
                <View style={[styles.section, { marginTop: 4 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #2A9D8F', paddingBottom: 4 }}>
                        <View style={{
                            width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F',
                            justifyContent: 'center', alignItems: 'center', marginRight: 10
                        }}>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }}>3</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#1F2937' }}>ANÁLISIS OCLUSAL</Text>
                    </View>

                    <View style={{ marginLeft: 5 }}>
                        {/* 3.1 Oclusion Manipulacion */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.1 OCLUSIÓN EN MANIPULACIÓN DE LA MANDÍBULA:</Text>
                            <View style={{ flexDirection: 'row', gap: 40, paddingLeft: 15 }}>
                                {RenderRadio('RC = MIH', data.analisis_oclusal?.manipulacion_mandibula === 'RC = MIH')}
                                {RenderRadio('RC ≠ MIH', data.analisis_oclusal?.manipulacion_mandibula === 'RC != MIH')}
                            </View>
                            <Text style={{ fontSize: 7, color: '#666', marginTop: 5, fontStyle: 'italic', paddingLeft: 15 }}>*Relación Céntrica (RC); Máxima Intercuspidación Habitual (MIH)</Text>
                        </View>

                        {/* TRANSVERSAL Header */}
                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>TRANSVERSAL</Text>
                        </View>

                        {/* 3.2 Relacion Transversal */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.2 RELACIÓN DENTAL TRANSVERSAL:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    {['Brodie', 'Normal', 'Mordida cruzada posterior bilateral', 'Mordida cruzada posterior unilateral lado'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_transversal?.tipo === opt))}
                                </View>
                                <View style={{ width: 100, gap: 10, borderLeft: '1 solid #000', paddingLeft: 15 }}>
                                    {RenderCheck('Derecho', data.analisis_oclusal?.relacion_transversal?.derecho)}
                                    {RenderCheck('Izquierdo', data.analisis_oclusal?.relacion_transversal?.izquierdo)}
                                </View>
                            </View>
                        </View>

                        {/* 3.3 Caracteristica Mordida Cruzada */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.3 CARACTERÍSTICA DE LA MORDIDA CRUZADA:</Text>
                            <View style={{ flexDirection: 'row', gap: 30, paddingLeft: 15 }}>
                                {RenderRadio('Esqueletal', data.analisis_oclusal?.caracteristica_mordida_cruzada === 'Esqueletal')}
                                {RenderRadio('Dento-alveolar', data.analisis_oclusal?.caracteristica_mordida_cruzada === 'Dento-alveolar')}
                                {RenderRadio('No presenta', data.analisis_oclusal?.caracteristica_mordida_cruzada === 'No presenta')}
                            </View>
                        </View>

                        {/* VERTICAL Header */}
                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>VERTICAL</Text>
                        </View>

                        {/* 3.4 Relacion Vertical */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.4 RELACIÓN DENTAL VERTICAL:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    {['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_vertical?.tipo === opt))}
                                </View>
                                <View style={{ width: 140, borderLeft: '1 solid #000', paddingLeft: 15 }}>
                                    <View style={{ backgroundColor: '#F3F4F6', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, color: '#4B5563' }}>VALOR (MM):</Text>
                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.analisis_oclusal?.relacion_vertical?.milimetros || '—'} mm</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 3.5 Curva de Spee */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.5 CURVA DE SPEE:</Text>
                            <View style={{ paddingLeft: 15 }}>
                                <View style={{ flexDirection: 'row', gap: 40, marginBottom: 5 }}>
                                    {RenderRadio('Normal', data.analisis_oclusal?.curva_spee?.tipo === 'Normal')}
                                    {RenderRadio('Alterada', data.analisis_oclusal?.curva_spee?.tipo === 'Alterada')}
                                </View>
                                <View style={{ paddingLeft: 15, gap: 3, marginTop: 5 }}>
                                    {RenderCheck('Alterada por extrusión de incisivos inferiores', data.analisis_oclusal?.curva_spee?.alterada_extrusion_incisivos_inferiores)}
                                    {RenderCheck('Alterada por extrusión de incisivos superiores', data.analisis_oclusal?.curva_spee?.alterada_extrusion_incisivos_superiores)}
                                    {RenderCheck('Alterada por intrusión de incisivos', data.analisis_oclusal?.curva_spee?.alterada_intrusion_incisivos)}
                                    {RenderCheck('Alterada por molares extruidos', data.analisis_oclusal?.curva_spee?.alterada_molares_extruidos)}
                                    {RenderCheck('Alterada por molares instruidos', data.analisis_oclusal?.curva_spee?.alterada_molares_instruidos)}
                                </View>
                            </View>
                        </View>

                        {/* SAGITAL Header */}
                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }} wrap={false}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>SAGITAL</Text>
                        </View>

                        {/* 3.6 Relacion Sagital */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.6 RELACIÓN SAGITAL DE INCISIVOS:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <View style={{ flex: 1, gap: 5 }}>
                                    {['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_sagital_incisivos?.tipo === opt))}
                                </View>
                                <View style={{ width: 140, borderLeft: '1 solid #000', paddingLeft: 15 }}>
                                    <View style={{ backgroundColor: '#F3F4F6', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, color: '#4B5563' }}>VALOR (MM):</Text>
                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.analisis_oclusal?.relacion_sagital_incisivos?.milimetros || '—'} mm</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* RELACION SAGITAL EN MIH Header */}
                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>RELACIÓN SAGITAL EN MIH</Text>
                        </View>

                        {/* 3.7 Relacion Caninos */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 8 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.7 RELACIÓN DE CANINOS (MIH):</Text>
                            <View style={{ flexDirection: 'row', gap: 20, paddingLeft: 15 }}>
                                {/* Lado Derecho */}
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO DERECHO</Text>
                                    <View style={{ gap: 2 }}>
                                        {[
                                            'Clase I',
                                            '1/4 Clase II',
                                            '1/2 Clase II',
                                            '3/4 Clase II',
                                            'Clase II completa',
                                            '1/4 Clase III',
                                            '1/2 Clase III',
                                            '3/4 Clase III',
                                            'Clase III completa'
                                        ].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_caninos_mih?.lado_derecho === opt, 7))}
                                    </View>
                                </View>

                                {/* Lado Izquierdo */}
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO IZQUIERDO</Text>
                                    <View style={{ gap: 2 }}>
                                        {[
                                            'Clase I',
                                            '1/4 Clase II',
                                            '1/2 Clase II',
                                            '3/4 Clase II',
                                            'Clase II completa',
                                            '1/4 Clase III',
                                            '1/2 Clase III',
                                            '3/4 Clase III',
                                            'Clase III completa'
                                        ].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_caninos_mih?.lado_izquierdo === opt, 7))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 3.8 Relacion Molares */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 6 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.8 RELACIÓN DE MOLARES (MIH):</Text>
                            <View style={{ flexDirection: 'row', gap: 20, paddingLeft: 15 }}>
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO DERECHO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_molares_mih?.lado_derecho === opt, 7))}
                                    </View>
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO IZQUIERDO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_molares_mih?.lado_izquierdo === opt, 7))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>RELACIÓN EN RC</Text>
                            <Text style={{ fontSize: 6, color: '#666', fontStyle: 'italic', marginTop: 2 }}>* Solo contestar si MIH es ≠ de RC</Text>
                        </View>

                        {/* 3.9 Relacion Caninos RC */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 6 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.9 RELACIÓN DE CANINOS (RC):</Text>
                            <View style={{ flexDirection: 'row', gap: 20, paddingLeft: 15 }}>
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO DERECHO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_caninos_rc?.lado_derecho === opt, 7))}
                                    </View>
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO IZQUIERDO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_caninos_rc?.lado_izquierdo === opt, 7))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 3.10 Relacion Molares RC */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 6 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.10 RELACIÓN DE MOLARES (RC):</Text>
                            <View style={{ flexDirection: 'row', gap: 20, paddingLeft: 15 }}>
                                <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO DERECHO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_molares_rc?.lado_derecho === opt, 7))}
                                    </View>
                                </View>
                                <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 6, borderRadius: 2 }}>
                                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1F2937' }}>LADO IZQUIERDO</Text>
                                    <View style={{ gap: 2 }}>
                                        {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.analisis_oclusal?.relacion_molares_rc?.lado_izquierdo === opt, 7))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 3.11 Linea Media */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 6 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>3.11 LÍNEA MEDIA:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <View style={{ flex: 1, gap: 4 }}>
                                    {RenderRadio('Coincidentes', data.analisis_oclusal?.linea_media?.tipo === 'Coincidentes')}
                                    {RenderCheck('Línea media superior desviada', data.analisis_oclusal?.linea_media?.linea_media_superior_desviada)}
                                    {RenderCheck('Línea media inferior desviada', data.analisis_oclusal?.linea_media?.linea_media_inferior_desviada)}
                                </View>
                                <View style={{ width: 140, borderLeft: '1 solid #000', paddingLeft: 15 }}>
                                    <View style={{ backgroundColor: '#F3F4F6', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, color: '#4B5563' }}>VALOR (MM):</Text>
                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.analisis_oclusal?.linea_media?.milimetros || '—'} mm</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#F8F9FA', padding: 4, marginTop: 10, borderLeft: '3 solid #2A9D8F' }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>EXTRA</Text>
                        </View>

                        {/* 3.12 Anomalias Dentales */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 10 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>3.12 ANOMALÍAS DENTALES (forma/color/número):</Text>
                            <View style={{ backgroundColor: '#F9FAFB', padding: 6, borderRadius: 2, marginLeft: 15 }}>
                                <Text style={{ fontSize: 9 }}>{data.analisis_oclusal?.anomalias_dentales || '—'}</Text>
                            </View>
                        </View>

                        {/* 3.13 Condicion ATM */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 10 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>3.13 CONDICIÓN DE LA ATM:</Text>
                            <View style={{ backgroundColor: '#F9FAFB', padding: 6, borderRadius: 2, marginLeft: 15 }}>
                                <Text style={{ fontSize: 9 }}>{data.analisis_oclusal?.condicion_atm || '—'}</Text>
                            </View>
                        </View>

                        {/* 3.14 Familiar Maloclusion */}
                        <View style={{ borderBottom: '1.2 solid #000', paddingVertical: 10 }} wrap={false}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>3.14 ¿Hay algún familiar con la misma maloclusión? Si es así, ¿quién?</Text>
                            <View style={{ backgroundColor: '#F9FAFB', padding: 6, borderRadius: 2, marginLeft: 15 }}>
                                <Text style={{ fontSize: 9 }}>{data.analisis_oclusal?.familiar_maloclusion || '—'}</Text>
                            </View>

                        </View>

                        {/* SECTION 4: ANÁLISIS CEFALOMÉTRICO */}

                        {/* SECTION 4: ANÁLISIS CEFALOMÉTRICO */}
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #E5E7EB', paddingBottom: 5 }} wrap={false}>
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>4</Text>
                                </View>
                                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' }}>ANÁLISIS CEFALOMÉTRICO</Text>
                            </View>

                            {/* 4.1 */}
                            <View style={{ marginBottom: 15 }} wrap={false}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>4.1 Alteraciones cefalométricas de las bases apicales.</Text>
                                <View style={{ backgroundColor: '#F0FDFA', padding: 8, borderRadius: 2, minHeight: 40, marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9 }}>{data.analisis_cefalometrico?.bases_apicales || ''}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#4B5563' }}>Rellenar esa sesión con datos cefalométricos que salen de la normalidad, referente a posición maxilo mandibular (Ejemplo: SNA, SNB, ANB). Si los valores son normales no llenar esa sección.</Text>
                            </View>

                            {/* 4.2 */}
                            <View style={{ marginBottom: 15 }} wrap={false}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>4.2 Alteraciones cefalométricas en relación a la tendencia de crecimiento.</Text>
                                <View style={{ backgroundColor: '#F0FDFA', padding: 8, borderRadius: 2, minHeight: 40, marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9 }}>{data.analisis_cefalometrico?.tendencia_crecimiento || ''}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#4B5563' }}>Rellenar esa sesión con datos cefalométricos que salen de la normalidad, referente a tendencia de crecimiento (Ejemplo: FMA, SnGn). Si los valores son normales no llenar esa sección.</Text>
                            </View>

                            {/* 4.3 */}
                            <View style={{ marginBottom: 15 }} wrap={false}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>4.3 Alteraciones cefalométricas en relación a los aspectos dento-alveolares.</Text>
                                <View style={{ backgroundColor: '#F0FDFA', padding: 8, borderRadius: 2, minHeight: 40, marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9 }}>{data.analisis_cefalometrico?.aspectos_dento_alveolares || ''}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#4B5563' }}>Rellenar esta sesión con datos cefalométricos que salen de la normalidad, referente a la posición de incisivos (Ejemplo: 1.NA, 1-NA, 1.NB, 1-NB). Si los valores son normales no llenar esa sección.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SECTION 5: DIAGNOSTICO FUNCIONAL */}
                <View style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #E5E7EB', paddingBottom: 5 }} wrap={false}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>5</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' }}>DIAGNÓSTICO FUNCIONAL</Text>
                    </View>

                    {/* 5.1 & 5.2 Row */}
                    <View style={{ flexDirection: 'row', gap: 20 }} wrap={false}>
                        {/* 5.1 Tipo de respiracion */}
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>5.1 Tipo de la respiración:</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['Oral', 'Nasal', 'Oronasal'].map(opt => RenderRadio(opt, data.diagnostico_funcional?.tipo_respiracion === opt))}
                            </View>
                        </View>

                        {/* 5.2 Frenillo Labial */}
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>5.2 Frenillo Labial</Text>
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                                {['Normal', 'Muy inserido'].map(opt => RenderRadio(opt, data.diagnostico_funcional?.frenillo_labial === opt))}
                                <Text style={{ fontSize: 7, color: '#0E7490', fontFamily: 'Helvetica-Bold', marginTop: 2 }}>* Examen de la isquemia</Text>
                            </View>
                        </View>
                    </View>

                    {/* 5.3 & 5.4 Row */}
                    <View style={{ flexDirection: 'row', gap: 20 }} wrap={false}>
                        {/* 5.3 Ronco */}
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>5.3 ¿Hay ronco durante el sueño?</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['Si', 'No'].map(opt => RenderRadio(opt, data.diagnostico_funcional?.ronco === opt))}
                            </View>
                        </View>

                        {/* 5.4 Bruxismo */}
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>5.4 Bruxismo / Desgastes:</Text>
                            <View style={{ gap: 4 }}>
                                {['No hay desgastes', 'Hay desgastes moderados en caninos y premolares', 'Hay desgastes severos con envolvimiento de las caras oclusales en dientes posteriores'].map(opt => RenderRadio(opt, data.diagnostico_funcional?.bruxismo === opt))}
                            </View>
                        </View>
                    </View>

                </View>

                <View style={styles.section}>
                    {/* SECTION 6: PLANIFICACIÓN DEL TRATAMIENTO */}
                    <View style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #E5E7EB', paddingBottom: 5 }}>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>6</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' }}>PLANIFICACIÓN DEL TRATAMIENTO</Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }} wrap={false}>
                            {/* 5. LISTA DE PROBLEMAS */}
                            <View style={{ flex: 1, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 4, minHeight: 80 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>5</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>LISTA DE PROBLEMAS</Text>
                                </View>
                                <Text style={{ fontSize: 9 }}>{data.planificacion_tratamiento?.lista_problemas || ''}</Text>
                            </View>

                            {/* 6. METAS DEL TRATAMIENTO */}
                            <View style={{ flex: 1, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 4, minHeight: 80 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>6</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>METAS DEL TRATAMIENTO</Text>
                                </View>
                                <Text style={{ fontSize: 9 }}>{data.planificacion_tratamiento?.metas_tratamiento || ''}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }} wrap={false}>
                            {/* 7. SECUENCIA DEL TRATAMIENTO */}
                            <View style={{ flex: 1, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 4, minHeight: 80 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>7</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>SECUENCIA DEL TRATAMIENTO</Text>
                                </View>
                                <Text style={{ fontSize: 9 }}>{data.planificacion_tratamiento?.secuencia_tratamiento || ''}</Text>
                            </View>

                            {/* 8. POSIBLES PROXIMAS ETAPAS */}
                            <View style={{ flex: 1, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 4, minHeight: 80 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>8</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>POSIBLES PRÓXIMAS ETAPAS</Text>
                                </View>
                                <Text style={{ fontSize: 9 }}>{data.planificacion_tratamiento?.posibles_proximas_etapas || ''}</Text>
                            </View>
                        </View>
                    </View>

                    {/* SECTION 7: PLAN DE TRATAMIENTO FINAL */}
                    <View style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottom: '2 solid #E5E7EB', paddingBottom: 5 }}>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A9D8F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>7</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' }}>PLAN DE TRATAMIENTO FINAL</Text>
                        </View>

                        <View style={{ marginBottom: 15 }} wrap={false}>
                            <View style={{ backgroundColor: '#DBEAFE', padding: 8, borderRadius: 2, minHeight: 120, marginBottom: 4 }}>
                                <Text style={{ fontSize: 9 }}>{data.plan_tratamiento_final?.plan_detallado || ''}</Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }} wrap={false}>
                            <View style={{ width: '40%', alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, marginBottom: 4 }}>{data.plan_tratamiento_final?.fecha || ''}</Text>
                                <View style={{ borderTop: '1 solid #000', width: '100%', paddingTop: 5, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>FECHA</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }} wrap={false}>
                            <View style={{ width: '40%', alignItems: 'center' }}>
                                <View style={{ borderTop: '1 solid #000', width: '100%', paddingTop: 5, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>FIRMA DEL PACIENTE</Text>
                                    {data.plan_tratamiento_final?.firma_paciente && <Text style={{ fontSize: 7, color: '#0E7490', marginTop: 2 }}>(Confirmado)</Text>}
                                </View>
                            </View>

                            <View style={{ width: '40%', alignItems: 'center' }}>
                                <View style={{ borderTop: '1 solid #000', width: '100%', paddingTop: 5, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>FIRMA DEL DOCTOR (A)</Text>
                                    {data.plan_tratamiento_final?.firma_doctor && <Text style={{ fontSize: 7, color: '#0E7490', marginTop: 2 }}>(Confirmado)</Text>}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>




        </Document >
    );
};

export default OrtodonciaDocument;
