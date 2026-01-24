import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, G, Line, Circle, Path } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 90,
        paddingBottom: 90,
        paddingHorizontal: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
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
    section: {
        marginBottom: 3,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#F3F4F6',
        paddingVertical: 1,
        paddingHorizontal: 6,
        borderLeft: '4 solid #374151',
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
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        marginRight: 4,
    },
    value: {
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    multilineValue: {
        fontSize: 8,
        fontFamily: 'Helvetica',
        lineHeight: 1.1,
    },
    odontogramContainer: {
        marginTop: 2,
        border: '1 solid #E5E7EB',
        borderRadius: 8,
        padding: 5,
        backgroundColor: '#FFFFFF',
    },
    // Nuevos estilos para la Tabla de Sección 4
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
    verticalLabel: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        transform: 'rotate(-90deg)',
        width: 100, // Ajustar según sea necesario
        textAlign: 'center',
    }
});

/**
 * 5-Part Tooth Component for PDF
 * Clones the visual style of Tooth5Parts.js
 */
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
    endodoncia: 'â–³',
    obturado: 'O',
    sellante_realizado: '*',
    endodoncia_real: 'â–³',
    prot_total: '===',
    removible: '(---)',
    fija: '[--]',
    perdida_otra: 'âŠ—',
    corona: 'â–£',
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
                y={cy + (isCircle ? 1 : 1)} // Vertical adjustment for better centering
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

const FichaOdontologiaDocument = ({ data = {} }) => {
    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/-/g, "").replace(/\s+/g, "").trim();

    const odontograma = data.odontograma || {};
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : '—';

    // Renders a single tooth block (FDI, Shapes, R, M)
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
    };

    const renderQuadrant = (ids, startX, startY, isCircle = false, reverse = false, hideRM = false) => {
        return ids.map((id, i) => (
            <G key={id}>{renderToothBlock(id, startX + (i * 28), startY, isCircle, reverse, hideRM)}</G>
        ));
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                {/* Reverted Sections 1-5 Labels and Structure */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>1. DATOS PERSONALES</Text>
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '30%' }]}>
                            <Text style={styles.label}>Nombre:</Text>
                            <Text style={styles.value}>{data.nombre || '—'} {data.apellido || ''}</Text>
                        </View>
                        <View style={[styles.col, { width: '25%' }]}>
                            <Text style={styles.label}>Cédula / ID:</Text>
                            <Text style={styles.value}>{data.cedula || '—'}</Text>
                        </View>
                        <View style={[styles.col, { width: '13%' }]}>
                            <Text style={styles.label}>Edad:</Text>
                            <Text style={styles.value}>{data.edad || '—'}</Text>
                        </View>
                        <View style={[styles.col, { width: '14%' }]}>
                            <Text style={styles.label}>Sexo:</Text>
                            <Text style={styles.value}>{data.sexo || '—'}</Text>
                        </View>
                        <View style={[styles.col, { width: '18%' }]}>
                            <Text style={styles.label}>Fecha:</Text>
                            <Text style={styles.value}>{formatDate(data.fecha)}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '30%' }]}>
                            <Text style={styles.label}>Celular:</Text>
                            <Text style={styles.value}>{data.celular || '—'}</Text>
                        </View>
                        <View style={[styles.col, { width: '70%' }]}>
                            <Text style={styles.label}>Dirección:</Text>
                            <Text style={styles.value}>{data.direccion || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* Restored Labels 2 and 3 */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.sectionTitle}>2. MOTIVO DE CONSULTA</Text>
                        <Text style={styles.multilineValue}>{data.motivo_consulta || '—'}</Text>
                    </View>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.sectionTitle}>3. ENFERMEDAD ACTUAL O PROBLEMA ACTUAL</Text>
                        <Text style={styles.multilineValue}>{data.enfermedad_actual || '—'}</Text>
                    </View>
                </View>

                {/* 4. ANTECEDENTES FAMILIARES Y PERSONALES (REDESIGN) */}
                <View style={[styles.table, { marginTop: 5 }]} wrap={false}>
                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>4. ANTECEDENTES FAMILIARES Y PERSONALES</Text>
                        </View>
                    </View>

                    {/* Conditions Grid 1-10 */}
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: 25, borderRightWidth: 1, borderBottomWidth: 1, backgroundColor: '#F3F4F6' }} />
                        <View style={{ flex: 1 }}>
                            <View style={styles.tableRow}>
                                {(() => {
                                    const allConditions = [
                                        ...(Array.isArray(data.patologias) ? data.patologias : []),
                                        ...(Array.isArray(data.alergias) ? data.alergias : [])
                                    ].map(c => normalize(c));

                                    const gridItems = [
                                        { id: 1, label: 'ALERGIA\nANTIBIOTICO' },
                                        { id: 2, label: 'ALERGIA\nANESTESIA' },
                                        { id: 3, label: 'HEMO-\nRRAGIAS' },
                                        { id: 4, label: 'VIH/\nSIDA' },
                                        { id: 5, label: 'TUBER-\nCULOSIS' },
                                        { id: 6, label: 'ASMA' },
                                        { id: 7, label: 'DIABETES' },
                                        { id: 8, label: 'HIPER-\nTENSION' },
                                        { id: 9, label: 'ENF.\nCARDIACA' },
                                        { id: 10, label: 'OTRO' }
                                    ];

                                    return gridItems.map((c, i) => {
                                        const searchLabel = normalize(c.label);
                                        const isChecked = allConditions.some(cond =>
                                            cond.includes(searchLabel) || searchLabel.includes(cond)
                                        );

                                        return (
                                            <View key={c.id} style={[styles.tableCell, { flexBasis: '10%', borderRightWidth: i === 9 ? 0 : 1 }]}>
                                                <Text style={styles.tableCellHeader}>{c.id}. {c.label}</Text>
                                                <Text style={styles.tableCellValue}>
                                                    {isChecked ? 'X' : ' '}
                                                </Text>
                                            </View>
                                        );
                                    });
                                })()}
                            </View>
                        </View>
                    </View>

                    {/* Row for "Otros" specification */}
                    {data.patologias?.includes('OTRO') && (
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: 25, borderRightWidth: 1, borderBottomWidth: 1 }} />
                            <View style={{ flex: 1 }}>
                                <View style={[styles.tableRow, { borderBottomWidth: 1, padding: 3 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.value}><Text style={styles.label}>10. OTROS:</Text> {data.patologias_otros || '________________________________________________'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vital Signs and Detailed Fields */}
                    <View style={{ flexDirection: 'row' }}>
                        {/* Vertical Label */}
                        <View style={styles.verticalLabelContainer}>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>SIGNOS VITALES</Text>
                        </View>

                        {/* Signs Grid */}
                        <View style={{ flex: 1 }}>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { flex: 1 }]}>
                                    <Text style={styles.tableCellHeader}>PULSO:</Text>
                                    <Text style={styles.tableCellValue}>{data.signos_vitales?.pulso || '—'} PPM</Text>
                                </View>
                                <View style={[styles.tableCell, { flex: 1 }]}>
                                    <Text style={styles.tableCellHeader}>PRESION ARTERIAL:</Text>
                                    <Text style={styles.tableCellValue}>{data.signos_vitales?.presion_arterial || '—'} mmHg</Text>
                                </View>
                                <View style={[styles.tableCell, { flex: 1 }]}>
                                    <Text style={styles.tableCellHeader}>FRECUENCIA RESPIRATORIA:</Text>
                                    <Text style={styles.tableCellValue}>{data.signos_vitales?.frecuencia_respiratoria || '—'} BPM</Text>
                                </View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>
                                    <Text style={styles.tableCellHeader}>TEMPERATURA:</Text>
                                    <Text style={styles.tableCellValue}>{data.signos_vitales?.temperatura || '—'} °C</Text>
                                </View>
                            </View>

                            {/* Text Fields */}
                            <View style={{ padding: 4, gap: 2 }}>
                                <Text style={styles.value}><Text style={styles.label}>TOMA MEDICAMENTOS:</Text> {data.medicamentos_actuales || '________________________________________________'}</Text>
                                <Text style={styles.value}><Text style={styles.label}>PROBLEMAS CON ANESTESIA LOCAL:</Text> {data.problemas_anestesia || '_______________________________________'}</Text>
                                <Text style={styles.value}><Text style={styles.label}>EMBARAZO:</Text> {data.embarazada ? (data.embarazada_detalle || 'SÍ') : 'NO'}</Text>
                                <Text style={[styles.value, { marginTop: 2 }]}><Text style={styles.label}>ANTECEDENTES DE ALERGIAS:</Text> {data.antecedentes_alergias || '____________________________________________________________________'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 5. EXAMEN DEL SISTEMA STOMATOGNATICO (REDESIGN) */}
                <View style={styles.table} wrap={false}>
                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { flex: 2, borderRightWidth: 1, backgroundColor: '#F3F4F6', padding: 3 }]}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>5. EXAMEN DEL SISTEMA STOMATOGNATICO</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0, flexDirection: 'row', gap: 10, padding: 3 }]}>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>Normal: N</Text>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>Patología: P</Text>
                        </View>
                    </View>

                    {/* Grid Row 1 (Items 1-9) */}
                    <View style={styles.tableRow}>
                        {[
                            { id: 1, label: 'LABIOS' },
                            { id: 2, label: 'MEJILLAS' },
                            { id: 3, label: 'MAXILAR\nSUPERIOR' },
                            { id: 4, label: 'MAXILAR\nINFERIOR' },
                            { id: 5, label: 'LENGUA' },
                            { id: 6, label: 'PALADAR' },
                            { id: 7, label: 'PISO' },
                            { id: 8, label: 'CARRILLOS' },
                            { id: 9, label: 'GANGLIOS' }
                        ].map((item, i) => {
                            const isPatologia = (data.examen_estomatognatico?.opciones || [])
                                .some(zona => normalize(zona) === normalize(item.label));

                            return (
                                <View key={item.id} style={[styles.tableCell, { flexBasis: '11.11%', borderRightWidth: 1, height: '100%' }]}>
                                    <Text style={styles.tableCellHeader}>{item.id}. {item.label}</Text>
                                    <Text style={styles.tableCellValue}>
                                        {isPatologia ? 'P' : 'N'}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Grid Row 2 (Items 10-12 + Description) */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        {[
                            { id: 10, label: 'GLANDULAS\nSALIVARES' },
                            { id: 11, label: 'ORO-\nFARINGE' },
                            { id: 12, label: 'A.T.M' }
                        ].map((item, i) => {
                            const isPatologia = (data.examen_estomatognatico?.opciones || [])
                                .some(zona => normalize(zona) === normalize(item.label));

                            return (
                                <View key={item.id} style={[styles.tableCell, { flexBasis: '11.11%', borderRightWidth: 1, height: '100%' }]}>
                                    <Text style={styles.tableCellHeader}>{item.id}. {item.label}</Text>
                                    <Text style={styles.tableCellValue}>
                                        {isPatologia ? 'P' : 'N'}
                                    </Text>
                                </View>
                            );
                        })}
                        {/* Merged cell for Description */}
                        <View style={[styles.tableCell, { flexBasis: '66.66%', borderRightWidth: 0, alignItems: 'flex-start', paddingLeft: 10, height: '100%' }]}>
                            <Text style={[styles.label, { fontSize: 7 }]}>DESCRIPCIÓN:</Text>
                            <Text style={{ fontSize: 7 }}>{data.examen_estomatognatico?.descripcion || '__________________________________'}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 6: CLONE OF FORM */}
                <View style={[styles.section, styles.odontogramContainer]} wrap={false}>
                    <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 5 }}>6. ODONTOGRAMA</Text>

                    <Svg width="520" height="300" viewBox="0 0 520 340">
                        {/* Labels Side Top */}
                        <G transform="translate(15, 35)">
                            <Text y="7" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>RECESIÓN</Text>
                            <Text y="18" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>MOVILIDAD</Text>
                            <Text y="29" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>PIEZA</Text>
                            <Text y="44" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>VESTIBULAR</Text>
                        </G>

                        {/* Q1 & Q2 */}
                        <G transform="translate(65, 35)">
                            {renderQuadrant(['18', '17', '16', '15', '14', '13', '12', '11'], 0, 0)}
                            <Line x1="216" y1="-5" x2="216" y2="55" stroke="#E5E7EB" strokeWidth={0.5} />
                            {renderQuadrant(['21', '22', '23', '24', '25', '26', '27', '28'], 230, 0)}
                        </G>

                        {/* Middle LINGUAL Section */}
                        <G transform="translate(15, 110)">
                            <Text x="0" y="30" style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', fill: '#2563eb' }}>LINGUAL</Text>
                            {/* Centered deciduous teeth */}
                            <G transform="translate(50, 0)">
                                {renderQuadrant(['55', '54', '53', '52', '51'], 42, 0, true, false, true)}
                                {renderQuadrant(['61', '62', '63', '64', '65'], 272, 0, true, false, true)}
                                <G transform="translate(0, 45)">
                                    {renderQuadrant(['85', '84', '83', '82', '81'], 42, 0, true, true, true)}
                                    {renderQuadrant(['71', '72', '73', '74', '75'], 272, 0, true, true, true)}
                                </G>
                            </G>
                        </G>

                        {/* Labels Side Bottom */}
                        <G transform="translate(15, 230)">
                            <Text y="10" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>VESTIBULAR</Text>
                            <Text y="28" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>PIEZA</Text>
                            <Text y="37" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>MOVILIDAD</Text>
                            <Text y="48" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>RECESIÓN</Text>
                        </G>

                        {/* Q4 & Q3 */}
                        <G transform="translate(65, 230)">
                            {renderQuadrant(['48', '47', '46', '45', '44', '43', '42', '41'], 0, 0, false, true)}
                            <Line x1="216" y1="-5" x2="216" y2="55" stroke="#E5E7EB" strokeWidth={0.5} />
                            {renderQuadrant(['31', '32', '33', '34', '35', '36', '37', '38'], 230, 0, false, true)}
                        </G>

                        {/* Axis Lines */}
                        <Line x1="281" y1="25" x2="281" y2="95" stroke="#cbd5e1" strokeWidth={0.5} />
                        <Line x1="281" y1="220" x2="281" y2="290" stroke="#cbd5e1" strokeWidth={0.5} />
                    </Svg>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>

            {/* Page 2: Clinical Indices & Legend */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                {/* 7. INDICADORES DE SALUD BUCAL */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. INDICADORES DE SALUD BUCAL</Text>

                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: '#F3F4F6' }]}>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={[styles.tableCellHeader, { fontSize: 6 }]}>P.D. 1</Text>
                            </View>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={[styles.tableCellHeader, { fontSize: 6 }]}>P.D. 2</Text>
                            </View>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={[styles.tableCellHeader, { fontSize: 6 }]}>P.D. 3</Text>
                            </View>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 1 }]}><Text style={[styles.tableCellHeader, { fontSize: 6 }]}>PLACA</Text></View>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 1 }]}><Text style={[styles.tableCellHeader, { fontSize: 6 }]}>CÁLCULO</Text></View>
                            <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 0 }]}><Text style={[styles.tableCellHeader, { fontSize: 6 }]}>GINGIV.</Text></View>
                        </View>
                        {[
                            ['16', '17', '55'],
                            ['11', '21', '51'],
                            ['26', '27', '65'],
                            ['36', '37', '75'],
                            ['31', '41', '71'],
                            ['46', '47', '85'],
                        ].map((rowPieces, i) => (
                            <View key={i} style={styles.tableRow}>
                                {rowPieces.map((p, pIndex) => (
                                    <View key={pIndex} style={[styles.tableCell, { flexBasis: '16.66%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }]}>
                                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>{p}</Text>
                                        <View style={{ width: 10, height: 10, border: '0.5 solid #000', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>{data.higiene_oral?.[i]?.[`m${pIndex + 1}`] || ''}</Text>
                                        </View>
                                    </View>
                                ))}
                                <View style={[styles.tableCell, { flexBasis: '16.66%' }]}><Text style={styles.tableCellValue}>{data.higiene_oral?.[i]?.placa || ''}</Text></View>
                                <View style={[styles.tableCell, { flexBasis: '16.66%' }]}><Text style={styles.tableCellValue}>{data.higiene_oral?.[i]?.calculo || ''}</Text></View>
                                <View style={[styles.tableCell, { flexBasis: '16.66%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.higiene_oral?.[i]?.gingivitis || ''}</Text></View>
                            </View>
                        ))}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                        <View style={{ flex: 1, border: '1 solid #000', padding: 4 }}>
                            <Text style={styles.label}>ENFERMEDAD PERIODONTAL:</Text>
                            <Text style={styles.value}>{data.enfermedad_periodontal || '—'}</Text>
                        </View>
                        <View style={{ flex: 1, border: '1 solid #000', padding: 4 }}>
                            <Text style={styles.label}>MALOCLUSIÓN:</Text>
                            <Text style={styles.value}>{data.maloclusion || '—'}</Text>
                        </View>
                        <View style={{ flex: 1, border: '1 solid #000', padding: 4 }}>
                            <Text style={styles.label}>FLUOROSIS:</Text>
                            <Text style={styles.value}>{data.fluorosis || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* 8. INDICES CPO-ceo */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>8. INDICES CPO-ceo</Text>
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <View style={[styles.table, { flex: 1 }]}>
                            <View style={[styles.tableRow, { backgroundColor: '#F3F4F6' }]}>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>D</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>C</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>P</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>O</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                            </View>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>D</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_cpo?.c || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_cpo?.p || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_cpo?.o || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.indices_cpo?.total || 0}</Text></View>
                            </View>
                        </View>
                        <View style={[styles.table, { flex: 1 }]}>
                            <View style={[styles.tableRow, { backgroundColor: '#F3F4F6' }]}>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>d</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>c</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>e</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellHeader}>o</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                            </View>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>d</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_ceo?.c || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_ceo?.e || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1 }]}><Text style={styles.tableCellValue}>{data.indices_ceo?.o || 0}</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.indices_ceo?.total || 0}</Text></View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { marginTop: 4 }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 7, marginBottom: 2 }]}>9. SIMBOLOGÍA DEL ODONTOGRAMA</Text>
                    <View style={{ border: '0.5 solid #000', padding: 3, flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[
                            { s: '*', c: '#D00000', label: 'SELL. NEC.' },
                            { s: '*', c: '#0066FF', label: 'SELL. REAL.' },
                            { s: 'X', c: '#D00000', label: 'EXTR. IND.' },
                            { s: 'X', c: '#0066FF', label: 'PÉRD. CARIES' },
                            { s: '⊗', c: '#0066FF', label: 'PÉRD. OTRA' },
                            { s: '△', c: '#0066FF', label: 'ENDODONCIA' },
                            { s: '[--]', c: '#0066FF', label: 'PRÓT. FIJA' },
                            { s: '(---)', c: '#0066FF', label: 'PRÓT. REMOV.' },
                            { s: '===', c: '#0066FF', label: 'PRÓT. TOTAL' },
                            { s: '▣', c: '#0066FF', label: 'CORONA' },
                            { s: 'O', c: '#0066FF', label: 'OBTURADO' },
                            { s: 'O', c: '#D00000', label: 'CARIES' },
                        ].map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', width: '16.6%', marginBottom: 1 }}>
                                <Text style={{ fontSize: 7, color: item.c, width: 15, fontFamily: 'Helvetica-Bold' }}>{item.s}</Text>
                                <Text style={{ fontSize: 5, color: '#374151' }}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 10. PLANES DE DIAGNÓSTICO */}
                <View style={[styles.section, { marginTop: 4 }]} wrap={false}>
                    <Text style={styles.sectionTitle}>10. PLANES DE DIAGNÓSTICO, TERAPÉUTICO Y EDUCACIONAL</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 1 }]}>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>BIOMETRIA</Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>QUIMICA SANGUÍNEA</Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>RAYOS - X</Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>OTROS</Text></View>
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 1 }]}>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, height: 15 }]}>
                                <Text style={[styles.tableCellValue, { fontSize: 8 }]}>{data.planes?.biometria ? 'X' : ''}</Text>
                            </View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, height: 15 }]}>
                                <Text style={[styles.tableCellValue, { fontSize: 8 }]}>{data.planes?.quimica_sanguinea ? 'X' : ''}</Text>
                            </View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, height: 15 }]}>
                                <Text style={[styles.tableCellValue, { fontSize: 8 }]}>{data.planes?.rayos_x ? 'X' : ''}</Text>
                            </View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0, height: 15 }]}>
                                <Text style={[styles.tableCellValue, { fontSize: 8 }]}>{data.planes?.otros ? 'X' : ''}</Text>
                            </View>
                        </View>

                        {/* Observaciones Vertical Layout imitating reference image */}
                        <View style={{ flexDirection: 'row', borderTopWidth: 0 }}>
                            <View style={{ width: 25, borderRightWidth: 1, borderRightColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', transform: 'rotate(-90deg)', width: 100, textAlign: 'center' }}>OBSERVACIONES:</Text>
                            </View>
                            <View style={{ flex: 1, padding: 4, minHeight: 60 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Helvetica', lineHeight: 1.5 }}>
                                    {data.planes?.observaciones || ''}
                                </Text>
                                {/* Draw lines for writing if empty */}
                                {!data.planes?.observaciones && (
                                    <>
                                        <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', height: 12, marginTop: 4 }} />
                                        <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', height: 12 }} />
                                        <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', height: 12 }} />
                                        <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#ccc', height: 12 }} />
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* 11. DIAGNÓSTICO */}
                <View style={[styles.section, { marginTop: 4 }]} wrap={false}>
                    <Text style={styles.sectionTitle}>11. DIAGNÓSTICO</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 1 }]}>
                            <View style={[styles.tableCell, { width: 25, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}></Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>PRE-PRESUNTIVO / DEF-DEFINITIVO</Text></View>
                            <View style={[styles.tableCell, { width: 40, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>CIE</Text></View>
                            <View style={[styles.tableCell, { width: 25, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>PRE</Text></View>
                            <View style={[styles.tableCell, { width: 25, borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>DEF</Text></View>
                        </View>
                        {(data.diagnostico?.items || [{ descripcion: '', cie: '', pre: false, def: false }, { descripcion: '', cie: '', pre: false, def: false }]).map((item, idx) => (
                            <View key={idx} style={[styles.tableRow, { borderBottomWidth: 1 }]}>
                                <View style={[styles.tableCell, { width: 25, borderRightWidth: 1 }]}><Text style={styles.tableCellValue}>{idx + 1}</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, paddingLeft: 4, alignItems: 'flex-start' }]}><Text style={[styles.tableCellValue, { textAlign: 'left' }]}>{item.descripcion || ''}</Text></View>
                                <View style={[styles.tableCell, { width: 40, borderRightWidth: 1 }]}><Text style={styles.tableCellValue}>{item.cie || ''}</Text></View>
                                <View style={[styles.tableCell, { width: 25, borderRightWidth: 1 }]}><Text style={styles.tableCellValue}>{item.pre ? 'X' : ''}</Text></View>
                                <View style={[styles.tableCell, { width: 25, borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{item.def ? 'X' : ''}</Text></View>
                            </View>
                        ))}
                    </View>

                    {/* Metadata boxes */}
                    <View style={{ flexDirection: 'row', border: '1 solid #000', marginTop: 1 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>FECHA DE APERTURA</Text>
                            <Text style={{ fontSize: 7, marginTop: 1 }}>{data.diagnostico?.fecha_apertura || '—'}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>FECHA DE CONTROL</Text>
                            <Text style={{ fontSize: 7, marginTop: 1 }}>{data.diagnostico?.fecha_control || '—'}</Text>
                        </View>
                        <View style={{ flex: 1.5, borderRightWidth: 1, borderRightColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>PROFESIONAL:</Text>
                            <Text style={{ fontSize: 7, marginTop: 1 }}>{data.diagnostico?.profesional || 'Dra. Diana Rodríguez'}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>FIRMA/SELLO</Text>
                            <View style={{ height: 10 }} />
                        </View>
                        <View style={{ flex: 1, padding: 2 }}>
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>NUMERO DE HOJA</Text>
                            <Text style={{ fontSize: 7, marginTop: 1, textAlign: 'center' }}>{data.diagnostico?.numero_hoja || '1'}</Text>
                        </View>
                    </View>
                </View>

                {/* 12. TRATAMIENTO */}
                <View style={[styles.section, { marginTop: 4 }]} wrap={true}>
                    <Text style={styles.sectionTitle}>12. TRATAMIENTO</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 1 }]}>
                            <View style={[styles.tableCell, { width: 45, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>FECHA</Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>DIAGNÓSTICO / COMPLICACIONES</Text></View>
                            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>PROCEDIMIENTOS / PRESCRIPCIÓN</Text></View>
                            <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>RESUMEN</Text></View>
                            <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>REC.</Text></View>
                            <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>IND.</Text></View>
                            <View style={[styles.tableCell, { flex: 0.8, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>OBSERVACIONES</Text></View>
                            <View style={[styles.tableCell, { width: 35, borderRightWidth: 1 }]}><Text style={styles.tableCellHeader}>PAGO</Text></View>
                            <View style={[styles.tableCell, { width: 40, borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>FIRMA</Text></View>
                        </View>
                        {(data.tratamiento || []).map((item, idx) => (
                            <View key={idx} style={[styles.tableRow, { borderBottomWidth: 1, minHeight: 25 }]} wrap={false}>
                                <View style={[styles.tableCell, { width: 45, borderRightWidth: 1 }]}><Text style={[styles.tableCellValue, { fontSize: 5, fontWeight: 'bold' }]}>{item.fecha || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.diagnostico || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 1, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.procedimiento || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.resumen || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.recomendaciones || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 0.6, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.indicaciones || ''}</Text></View>
                                <View style={[styles.tableCell, { flex: 0.8, borderRightWidth: 1, paddingLeft: 3 }]}><Text style={[styles.tableCellValue, { textAlign: 'left', fontSize: 5 }]}>{item.observaciones || ''}</Text></View>
                                <View style={[styles.tableCell, { width: 35, borderRightWidth: 1 }]}><Text style={[styles.tableCellValue, { fontSize: 5 }]}>{item.pago || ''}</Text></View>
                                <View style={[styles.tableCell, { width: 40, borderRightWidth: 0 }]}><Text style={[styles.tableCellValue, { fontSize: 5 }]}>{item.firma || ''}</Text></View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* CONSENTIMIENTO INFORMADO */}
                <View style={[styles.section, { marginTop: 15 }]} wrap={false}>
                    <Text style={[styles.sectionTitle, { backgroundColor: '#F3F4F6' }]}>CONSENTIMIENTO INFORMADO</Text>
                    <View style={{ border: '1 solid #000', padding: 5 }}>
                        <Text style={{ fontSize: 7, textAlign: 'justify', lineHeight: 1.4, marginBottom: 10 }}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>CONSENTIMIENTO INFORMADO: </Text>
                            Entiendo y he sido informando/a sobre los propósitos del tratamiento, riesgos y posibles complicaciones, por lo que autorizo al profesional actuante a realizar los procedimientos odontológicos necesarios.
                        </Text>

                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingVertical: 2 }}>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 100 }}>Paciente/ Representante:</Text>
                                <Text style={{ fontSize: 7, flex: 1 }}>{data.consentimiento?.paciente_representante || ''}</Text>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 20 }}>C.I.</Text>
                                <Text style={{ fontSize: 7, width: 80 }}>{data.consentimiento?.ci || ''}</Text>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 30 }}>Firma:</Text>
                                <Text style={{ fontSize: 7, width: 80 }}>{data.consentimiento?.firma || ''}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingVertical: 2 }}>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 100 }}>Correo:</Text>
                                <Text style={{ fontSize: 7, flex: 1 }}>{data.consentimiento?.correo || ''}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingVertical: 2 }}>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 100 }}>Teléfono:</Text>
                                <Text style={{ fontSize: 7, flex: 1 }}>{data.consentimiento?.telefono || ''}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingVertical: 2 }}>
                                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', width: 100 }}>Dirección:</Text>
                                <Text style={{ fontSize: 7, flex: 1 }}>{data.consentimiento?.direccion || ''}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default FichaOdontologiaDocument;
