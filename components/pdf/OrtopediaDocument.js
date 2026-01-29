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
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderLeft: '4 solid #2A9D8F',
        marginBottom: 6,
        textTransform: 'uppercase',
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
        flexShrink: 1,
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
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableCell: {
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 4,
        justifyContent: 'center',
    },
    tableCellHeader: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    tableCellValue: {
        fontSize: 8,
        textAlign: 'left',
    },
});

const OrtopediaDocument = ({ data = {}, mode = 1 }) => {
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

    const isFull = mode === 1 || !mode;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.backgroundImageContainer} fixed>
                    <Image src="/pdf-background.jpg" style={styles.backgroundImage} />
                </View>
                {/* Header */}
                <View style={styles.header} fixed>
                    <Image src="/pdf-header.jpg" style={styles.headerImage} />
                </View>

                {/* Content */}
                {isFull && (
                    <View>
                        {/* Sección 1: Datos del Paciente */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>1. Datos del Paciente</Text>
                            <View style={styles.row}>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>1.1. Nombre del paciente:</Text>
                                        <Text style={styles.value}>{data.nombre || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Edad:</Text>
                                        <Text style={styles.value}>{data.edad || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>1.2. País y ciudad:</Text>
                                        <Text style={styles.value}>{data.pais_ciudad || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Hexadent ID / Cédula:</Text>
                                        <Text style={styles.value}>{data.cedula || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>1.3. Nombre del tutor:</Text>
                                        <Text style={styles.value}>{data.tutor || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.column}>
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Celular Contacto:</Text>
                                        <Text style={styles.value}>{data.celular || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.4 Gustos personales (color, canal youtube, juguetes):</Text>
                                <Text style={styles.value}>{data.gustos_personales || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.5 Queja principal - ¿Porqué buscó tratamiento?:</Text>
                                <Text style={styles.value}>{data.queja_principal || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.6 Hábitos de succión:</Text>
                                <Text style={styles.value}>{data.habitos_succion || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.7 Historia médica/medicación de uso contínuo:</Text>
                                <Text style={styles.value}>{data.historia_medica || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.8 Histórico de accidentes o traumas:</Text>
                                <Text style={styles.value}>{data.historico_accidentes || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.9 Estructura familiar:</Text>
                                <Text style={styles.value}>{data.estructura_familiar || '—'}</Text>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.10 Índice de colaboración:</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 2, marginBottom: 4 }}>
                                    {['Alto', 'Medio', 'Bajo'].map(opt => RenderRadio(opt, data.indice_colaboracion === opt))}
                                </View>
                                {data.indice_colaboracion_obs && (
                                    <Text style={{ fontSize: 8, color: '#4B5563', paddingLeft: 10 }}>Obs: {data.indice_colaboracion_obs}</Text>
                                )}
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.11 Higiene oral:</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                                    {['Adecuada', 'Deficiente'].map(opt => RenderRadio(opt, data.higiene_oral === opt))}
                                </View>
                            </View>
                            <View style={styles.field} wrap={false}>
                                <Text style={styles.label}>1.12 ¿La 1ª menstruación ya ocurrió? (Solo niña):</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                                    {['Si', 'No'].map(opt => RenderRadio(opt, data.menstruacion === opt))}
                                </View>
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>1.13 Necessidad de tratamiento general (cáries, otros):</Text>
                                <Text style={styles.value}>{data.necesidad_tratamiento || '—'}</Text>
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>1.14 Características importantes de la hereditariedad:</Text>
                                <Text style={styles.value}>{data.hereditariedad || '—'}</Text>
                            </View>
                        </View>

                        {/* Sección 2: Análisis Facial */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Análisis Facial</Text>
                            <View style={{ marginBottom: 4 }} wrap={false}>
                                <Text style={styles.label}>2.1. TIPO FACIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                                    {['Mesofacial', 'Dolicofacial', 'Braquifacial'].map(opt => RenderRadio(opt, data.s2_tipo_facial === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4 }} wrap={false}>
                                <Text style={styles.label}>2.2. CONVEXIDAD FACIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                                    {['Recto', 'Cóncavo', 'Convexo'].map(opt => RenderRadio(opt, data.s2_convexidad === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.3. PROPORCIÓN DE LOS TERCIOS FACIALES:</Text>
                                <View style={{ gap: 4, marginTop: 4 }}>
                                    {['Proporcionales', 'Sin proporción con tercios aumentados', 'Sin proporción con tercios diminuído'].map(opt => RenderRadio(opt, data.s2_tercios_proporcion === opt))}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 15, marginTop: 6, pl: 15 }}>
                                    {['Superior', 'Inferior', 'Medio'].map(part => RenderCheck(part, data[`s2_tercios_${part.toLowerCase()}`]))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.4. SELLADO LABIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                                    {['Pasivo', 'Comprensivo'].map(opt => RenderRadio(opt, data.s2_sellado_labial === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.5 RELACIÓN ANTERO-POSTERIOR DE LÁBIOS:</Text>
                                <View style={{ gap: 4, marginTop: 4 }}>
                                    {['Labio superior delante del inferior', 'Labio inferior delante del labio superior'].map(opt => RenderRadio(opt, data.s2_relacion_labios === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.6 SIMETRÍA FACIAL EN REPOSO:</Text>
                                <View style={{ flexDirection: 'row', gap: 30, marginTop: 4 }}>
                                    <View style={{ gap: 4 }}>
                                        {['Paciente simétrico', 'Paciente asimétrico'].map(opt => RenderRadio(opt, data.s2_simetria_reposo === opt))}
                                    </View>
                                    <View style={{ gap: 4, borderLeft: '0.5 solid #2A9D8F', pl: 15 }}>
                                        {RenderCheck('Derecha', data.s2_simetria_reposo_der)}
                                        {RenderCheck('Izquierda', data.s2_simetria_reposo_izq)}
                                    </View>
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.7 SIMETRÍA FACIAL EN APERTURA BUCAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 30, marginTop: 4 }}>
                                    <View style={{ gap: 4, minWidth: 100 }}>
                                        {['Presenta', 'No presenta'].map(opt => RenderRadio(opt, data.s2_simetria_apertura === opt))}
                                    </View>
                                    <View style={{ gap: 4, borderLeft: '0.5 solid #2A9D8F', pl: 15 }}>
                                        {RenderCheck('Derecha', data.s2_simetria_apertura_der)}
                                        {RenderCheck('Izquierda', data.s2_simetria_apertura_izq)}
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.8. ÁNGULO NASOLABIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Abierto', 'Disminuido'].map(opt => RenderRadio(opt, data.s2_angulo_nasolabial === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.9. SURCO MENTOLABIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Profundo', 'Poco Profundo'].map(opt => RenderRadio(opt, data.s2_surco_mentolabial === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.10. PROYECCIÓN CIGOMÁTICA:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Aumentada', 'Deficiente'].map(opt => RenderRadio(opt, data.s2_proyeccion_cigomatica === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.11. LÍNEA MENTÓN-CUELLO:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Aumentada', 'Disminuida'].map(opt => RenderRadio(opt, data.s2_linea_menton_cuello === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                <Text style={styles.label}>2.12. ÁNGULO MENTÓN-CUELLO:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Abierto', 'Cerrado'].map(opt => RenderRadio(opt, data.s2_angulo_menton_cuello === opt))}
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3 }}>
                                <Text style={styles.label}>2.13. PATRÓN FACIAL:</Text>
                                <View style={{ gap: 6, marginTop: 4 }}>
                                    {RenderRadio('Patrón I', data.s2_patron_facial === 'Patron I')}
                                    <View style={{ backgroundColor: 'transparent', padding: 6, borderRadius: 2, marginTop: 2 }}>
                                        {RenderRadio('Patrón II', data.s2_patron_facial === 'Patron II')}
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 3, paddingLeft: 20, flexWrap: 'wrap' }}>
                                            {RenderCheck('Retrusión Mand.', data.s2_patron_ii_retrusion_mand)}
                                            {RenderCheck('Protrusión Max.', data.s2_patron_ii_protrusion_max)}
                                            {RenderCheck('Aumento AFAI', data.s2_patron_ii_aumento_afai)}
                                            {RenderCheck('AFAI Dismin.', data.s2_patron_ii_disminuida_afai)}
                                        </View>
                                    </View>
                                    <View style={{ backgroundColor: 'transparent', padding: 6, borderRadius: 2, marginTop: 2 }}>
                                        {RenderRadio('Patrón III', data.s2_patron_facial === 'Patron III')}
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 3, paddingLeft: 20, flexWrap: 'wrap' }}>
                                            {RenderCheck('Protrusión Mand.', data.s2_patron_iii_protrusion_mand)}
                                            {RenderCheck('Retrusión Max.', data.s2_patron_iii_retrusion_max)}
                                            {RenderCheck('Aumento AFAI', data.s2_patron_iii_aumento_afai)}
                                            {RenderCheck('AFAI Dismin.', data.s2_patron_iii_disminuida_afai)}
                                        </View>
                                    </View>
                                    {RenderRadio('Cara Corta', data.s2_patron_facial === 'Cara Corta')}
                                    {RenderRadio('Cara Larga', data.s2_patron_facial === 'Cara Larga')}
                                </View>
                            </View>
                        </View>

                        {/* Sección 3: Análisis Oclusal */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. Análisis Oclusal</Text>
                            <View style={{ marginBottom: 4 }} wrap={false}>
                                <Text style={styles.label}>3.1. OCLUSIÓN EM MANIPULACIÓN DE LA MANDÍBULA:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['RC = MIH', 'RC != MIH'].map(opt => RenderRadio(opt, data.s3_oclusion_manipulacion === opt))}
                                </View>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 3, fontStyle: 'italic' }}>*Relación Céntrica (RC); Máxima Intercuspidación Habitual (MIH)</Text>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>TRANSVERSAL</Text>
                                </View>
                                <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                    <Text style={styles.label}>3.2. RELACIÓN DENTAL TRANSVERSAL:</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={{ flex: 1, gap: 3 }}>
                                            {['Brodie', 'Normal', 'Mordida cruzada posterior bilateral', 'Mordida cruzada posterior unilateral lado'].map(opt => RenderRadio(opt, data.s3_relacion_transversal === opt, 8))}
                                        </View>
                                        <View style={{ width: 100, gap: 4, borderLeft: '1 solid #2A9D8F', paddingLeft: 10 }}>
                                            {RenderCheck('Derecho', data.s3_transversal_derecho)}
                                            {RenderCheck('Izquierdo', data.s3_transversal_izquierdo)}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                    <Text style={styles.label}>3.3. CARACTERÍSTICA DE LA MORDIDA CRUZADA:</Text>
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                        {['Esqueletal', 'Dento-alveolar', 'No presenta'].map(opt => RenderRadio(opt, data.s3_caracteristica_mordida === opt))}
                                    </View>
                                </View>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>VERTICAL</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                    <Text style={styles.label}>3.4. RELACIÓN DENTAL VERTICAL:</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={{ flex: 1, gap: 3 }}>
                                            {['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de'].map(opt => RenderRadio(opt, data.s3_relacion_vertical === opt, 8))}
                                        </View>
                                        <View style={{ width: 120, borderLeft: '1 solid #2A9D8F', paddingLeft: 10 }}>
                                            <View style={{ backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                                <Text style={{ fontSize: 7, color: '#4B5563' }}>VALOR (MM):</Text>
                                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.s3_vertical_milimetros || '—'} mm</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }} wrap={false}>
                                    <Text style={styles.label}>3.5. CURVA DE SPEE:</Text>
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                        {['Normal', 'Alterada'].map(opt => RenderRadio(opt, data.s3_curva_spee === opt))}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap', paddingLeft: 15 }}>
                                        {RenderCheck('Ext. Inc. Inf.', data.s3_curva_alt_extrusion_inf)}
                                        {RenderCheck('Ext. Inc. Sup.', data.s3_curva_alt_extrusion_sup)}
                                        {RenderCheck('Intr. Inc.', data.s3_curva_alt_intrusion)}
                                        {RenderCheck('Mol. Extruidos', data.s3_curva_alt_molares_extruidos)}
                                        {RenderCheck('Mol. Instruidos', data.s3_curva_alt_molares_instruidos)}
                                    </View>
                                </View>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>SAGITAL</Text>
                                </View>
                                <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3 }}>
                                    <Text style={styles.label}>3.6. RELACIÓN SAGITAL DE INCISIVOS:</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={{ flex: 1, gap: 3 }}>
                                            {['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de'].map(opt => RenderRadio(opt, data.s3_relacion_sagital === opt, 8))}
                                        </View>
                                        <View style={{ width: 120, borderLeft: '1 solid #2A9D8F', paddingLeft: 10 }}>
                                            <View style={{ backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                                <Text style={{ fontSize: 7, color: '#4B5563' }}>VALOR (MM):</Text>
                                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.s3_sagital_milimetros || '—'} mm</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>RELACIÓN SAGITAL EN MIH</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3 }}>
                                    <Text style={styles.label}>3.7. RELACIÓN DE CANINOS (MIH):</Text>
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO DERECHO</Text>
                                            <View style={{ gap: 2 }}>
                                                {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_caninos_mih_derecho === opt, 7))}
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO IZQUIERDO</Text>
                                            <View style={{ gap: 2 }}>
                                                {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_caninos_mih_izquierdo === opt, 7))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 6 }} wrap={false}>
                                <Text style={styles.label}>3.8. RELACIÓN DE MOLARES:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                                    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO DERECHO</Text>
                                        <View style={{ gap: 2 }}>
                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_molares_derecho === opt, 7))}
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO IZQUIERDO</Text>
                                        <View style={{ gap: 2 }}>
                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_molares_izquierdo === opt, 7))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>RELACIÓN EN RC</Text>
                                    <Text style={{ fontSize: 6, color: '#666', fontStyle: 'italic' }}>* Solo contestar si MIH es ≠ de RC</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3 }}>
                                    <Text style={styles.label}>3.9 RELACIÓN DE CANINOS (RC):</Text>
                                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO DERECHO</Text>
                                            <View style={{ gap: 2 }}>
                                                {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_caninos_rc_derecho === opt, 7))}
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO IZQUIERDO</Text>
                                            <View style={{ gap: 2 }}>
                                                {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_caninos_rc_izquierdo === opt, 7))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 6 }} wrap={false}>
                                <Text style={styles.label}>3.10. RELACIÓN DE MOLARES:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                                    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO DERECHO</Text>
                                        <View style={{ gap: 2 }}>
                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_molares_mih_derecho === opt, 7))}
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 6, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4B5563', marginBottom: 3 }}>LADO IZQUIERDO</Text>
                                        <View style={{ gap: 2 }}>
                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(opt => RenderRadio(opt, data.s3_molares_mih_izquierdo === opt, 7))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 6 }} wrap={false}>
                                <Text style={styles.label}>3.11 LÍNEA MEDIA:</Text>
                                <View style={{ marginTop: 2 }}>
                                    {RenderRadio('Coincidentes', data.s3_linea_media === 'Coincidentes')}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 15, marginTop: 4, paddingLeft: 15 }}>
                                    {RenderCheck('L.M. Superior desviada', data.s3_linea_media_superior_desviada)}
                                    {RenderCheck('L.M. Inferior desviada', data.s3_linea_media_inferior_desviada)}
                                </View>
                                <View style={{ marginTop: 4, backgroundColor: 'transparent', padding: 6, borderRadius: 2, maxWidth: 150 }}>
                                    <Text style={{ fontSize: 7, color: '#4B5563' }}>EN MILÍMETROS:</Text>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{data.s3_linea_media_milimetros || '—'} mm</Text>
                                </View>
                            </View>
                            <View wrap={false}>
                                <View style={{ backgroundColor: 'transparent', padding: 4, marginTop: 6, borderLeft: '3 solid #2A9D8F' }}>
                                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>EXTRA</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, width: '100%' }}>
                                    <Text style={styles.label}>3.12 Anomalías Dentales (forma/color/número):</Text>
                                    <Text style={{ fontSize: 8, marginTop: 2, width: '100%' }}>{data.s3_anomalias_dentales || '—'}</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4, width: '100%' }}>
                                    <Text style={styles.label}>3.13 Condición de la ATM:</Text>
                                    <Text style={{ fontSize: 8, marginTop: 2, width: '100%' }}>{data.s3_condicion_atm || '—'}</Text>
                                </View>
                                <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4, width: '100%' }}>
                                    <Text style={styles.label}>3.14 ¿Hay algún familiar con la misma maloclusión? Si es así, ¿quién?</Text>
                                    <Text style={{ fontSize: 8, marginTop: 2, width: '100%' }}>{data.s3_familiar_maloclusion || '—'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>4. Análisis Cefalométrico</Text>
                            <View style={{ marginBottom: 8, width: '100%' }}>
                                <Text style={styles.label}>4.1 Alteraciones cefalometricas de las bases apicales:</Text>
                                <View style={{ backgroundColor: 'transparent', padding: 6, marginTop: 4, borderRadius: 2, width: '100%' }}>
                                    <Text style={{ fontSize: 8, width: '100%' }}>{data.s4_bases_apicales || 'Normal'}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2, fontStyle: 'italic' }}>* Posición maxilo mandibular (Ej: SNA, SNB, ANB)</Text>
                            </View>
                            <View style={{ marginBottom: 8, borderTop: '0.5 solid #E5E7EB', pt: 4, width: '100%' }}>
                                <Text style={styles.label}>4.2 Alteraciones cefalometricas en relación a la tendencia de crecimiento:</Text>
                                <View style={{ backgroundColor: 'transparent', padding: 6, marginTop: 4, borderRadius: 2, width: '100%' }}>
                                    <Text style={{ fontSize: 8, width: '100%' }}>{data.s4_tendencia_crecimiento || 'Normal'}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2, fontStyle: 'italic' }}>* Tendencia de crecimiento (Ej: FMA, SnGn)</Text>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 4, width: '100%' }}>
                                <Text style={styles.label}>4.3 Alteraciones cefalométricas en relación a los aspectos dento-alveolares:</Text>
                                <View style={{ backgroundColor: 'transparent', padding: 6, marginTop: 4, borderRadius: 2, width: '100%' }}>
                                    <Text style={{ fontSize: 8, width: '100%' }}>{data.s4_aspectos_dentoalveolares || 'Normal'}</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2, fontStyle: 'italic' }}>* Posición de incisivos (Ej: 1.NA, 1-NA, 1.NB, 1-NB)</Text>
                            </View>
                        </View>

                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>5. Diagnóstico Funcional</Text>
                            <View style={{ marginBottom: 4 }} wrap={false}>
                                <Text style={styles.label}>5.1 TIPO DE LA RESPIRACIÓN:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Oral', 'Nasal', 'Oronasal'].map(opt => RenderRadio(opt, data.s5_tipo_respiracion === opt))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4 }} wrap={false}>
                                <Text style={styles.label}>5.2 FRENILLO LABIAL:</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Normal', 'Muy inserido'].map(opt => RenderRadio(opt, data.s5_frenillo_labial === opt))}
                                </View>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2, fontStyle: 'italic' }}>* Examen de la isquemia</Text>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4 }} wrap={false}>
                                <Text style={styles.label}>5.3 ¿EL NIÑO RONCA DURANTE EL SUEÑO?</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {RenderRadio('Sí (Llenar el formulário de apnea)', data.s5_ronca === 'Sí')}
                                    {RenderRadio('No', data.s5_ronca === 'No')}
                                </View>
                            </View>
                            <View style={{ marginBottom: 4, borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4 }} wrap={false}>
                                <Text style={styles.label}>5.4 PRUEBA DE HABLA: SESSENTA Y SEIS, ARENA, ARAÑA, RANA</Text>
                                <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
                                    {['Habla normal', 'Habla imprecisa'].map(opt => RenderRadio(opt, data.s5_prueba_habla === opt))}
                                </View>
                            </View>
                            <View style={{ borderTop: '0.5 solid #E5E7EB', pt: 3, marginTop: 4 }} wrap={false}>
                                <Text style={styles.label}>5.5 ¿HAY SEÑALES DE DESGASTES DENTALES POR BRUXISMO?</Text>
                                <View style={{ gap: 4, marginTop: 2 }}>
                                    {RenderRadio('No hay desgastes', data.s5_desgastes_bruxismo === 'No hay desgastes')}
                                    {RenderRadio('Desgastes en piezas temporales', data.s5_desgastes_bruxismo === 'Desgastes en piezas temporales')}
                                    {RenderRadio('Desgastes en piezas temporales y permanentes', data.s5_desgastes_bruxismo === 'Desgastes en piezas temporales y permanentes')}
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 8, flexDirection: 'row', gap: 10 }} wrap={false}>
                            <View style={{ flex: 1, backgroundColor: 'transparent', padding: 8, borderRadius: 4, border: '0.5 solid #CBD5E1', minHeight: 120 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>6. LISTA DE PROBLEMAS</Text>
                                <Text style={{ fontSize: 9 }}>{data.s6_lista_problemas || '—'}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: 'transparent', padding: 8, borderRadius: 4, border: '0.5 solid #CBD5E1', minHeight: 120 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>7. METAS DEL TRATAMIENTO</Text>
                                <Text style={{ fontSize: 9 }}>{data.s7_metas_tratamiento || '—'}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 8, flexDirection: 'row', gap: 10 }} wrap={false}>
                            <View style={{ flex: 1, backgroundColor: 'transparent', padding: 8, borderRadius: 4, border: '0.5 solid #CBD5E1', minHeight: 120 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>8. SECUENCIA DEL TRATAMIENTO</Text>
                                <Text style={{ fontSize: 9 }}>{data.s8_secuencia_tratamiento || '—'}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: 'transparent', padding: 8, borderRadius: 4, border: '0.5 solid #CBD5E1', minHeight: 120 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>9. POSIBLES PRÓXIMAS ETAPAS</Text>
                                <Text style={{ fontSize: 9 }}>{data.s9_proximas_etapas || '—'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Bloque Final: Plan de Tratamiento + Firmas (Shared Header/Footer) */}
                {/* Bloque Final: Plan de Tratamiento + Firmas + Mode 2 (Wrapper must allow breaking) */}
                <View>
                    {/* Section 10: Plan de Tratamiento Final (Only in Full) */}
                    {isFull && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>10. PLAN DE TRATAMIENTO FINAL</Text>
                            <View style={{ backgroundColor: 'transparent', padding: 10, borderRadius: 4, border: '0.5 solid #CBD5E1', minHeight: 80, width: '100%' }}>
                                <Text style={{ fontSize: 10, lineHeight: 1.5, width: '100%' }}>{data.s13_plan_tratamiento_final || '—'}</Text>
                            </View>
                        </View>
                    )}

                    {/* Signatures Section (Only in Mode 1) */}
                    {isFull && (
                        <View style={{ marginTop: 20 }} wrap={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 15 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>FECHA:</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', paddingBottom: 2, minHeight: 15 }}>{data.s13_fecha || ''}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>FIRMA DEL PACIENTE:</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', paddingBottom: 2, minHeight: 15 }}>{data.s13_firma_paciente || ''}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>FIRMA DEL DOCTOR(A):</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', paddingBottom: 2, minHeight: 15 }}>{data.s13_firma_doctor || ''}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Mode 2: Structured Justification Report */}
                    {mode === 2 && (
                        <View style={{ marginTop: 10 }}>
                            {/* Report Header */}
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 15, textDecoration: 'underline' }}>
                                TRATAMIENTO DE ORTOPEDIA PREVIO A ORTODONCIA
                            </Text>

                            {/* Patient Info Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>Paciente: <Text style={{ fontFamily: 'Helvetica' }}>{data.nombre?.toUpperCase() || '—'}</Text></Text>
                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>Edad: <Text style={{ fontFamily: 'Helvetica' }}>{data.edad || '—'} años</Text></Text>
                            </View>

                            {/* Intro Paragraph - Flexible View without rigid Border */}
                            <View style={{ marginBottom: 15, border: '1 solid #000', padding: 8 }} wrap={false}>
                                <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{data.s14_justificacion_texto || '—'}</Text>
                            </View>

                            {/* FASE 1 TABLE */}
                            <View style={styles.table}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, { backgroundColor: 'transparent' }]}>
                                    <View style={[styles.tableCell, { width: '15%' }]}>
                                        <Text style={styles.tableCellHeader}>FASE 1</Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '50%' }]}>
                                        <Text style={styles.tableCellHeader}>Tratamiento de ortopedia y detalle</Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '25%' }]}>
                                        <Text style={styles.tableCellHeader}>objetivo</Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '10%', borderRightWidth: 0 }]}>
                                        <Text style={[styles.tableCellHeader, { fontSize: 8 }]}>Valor en dólares total</Text>
                                    </View>
                                </View>

                                {/* Dynamic Rows for Phase 1 */}
                                {(data.s14_f1_filas || []).map((fila, i) => (
                                    <View key={`f1-${i}`} style={styles.tableRow}>
                                        <View style={[styles.tableCell, { width: '15%' }]}>
                                            <Text style={[styles.tableCellValue, { textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                                                {fila.categoria?.toUpperCase() || '—'}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '50%' }]}>
                                            <Text style={[styles.tableCellValue, { lineHeight: 1.3 }]}>{fila.tratamiento_detalle || '—'}</Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '25%' }]}>
                                            <Text style={[styles.tableCellValue, { lineHeight: 1.3 }]}>{fila.objetivo || '—'}</Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '10%', borderRightWidth: 0 }]}>
                                            <Text style={styles.tableCellValue}></Text>
                                        </View>
                                    </View>
                                ))}

                                {/* Payment Breakdown Row */}
                                <View style={styles.tableRow}>
                                    <View style={[styles.tableCell, { width: '15%' }]} />
                                    <View style={[styles.tableCell, { width: '75%' }]}>
                                        <Text style={[styles.tableCellValue, { lineHeight: 1.4 }]}>
                                            {data.s14_f1_ppto_detalle || '—'}
                                        </Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '10%', borderRightWidth: 0 }]} />
                                </View>

                                {/* TOTAL Row */}
                                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                                    <View style={[styles.tableCell, { width: '15%' }]} />
                                    <View style={[styles.tableCell, { width: '75%' }]}>
                                        <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>TOTAL</Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '10%', borderRightWidth: 0 }]}>
                                        <Text style={styles.tableCellHeader}>{data.s14_f1_total || '0.00'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* FASE 2 TABLE */}
                            <View style={[styles.table, { marginTop: 15 }]}>
                                {/* table 2 header */}
                                <View style={[styles.tableRow, { backgroundColor: 'transparent' }]}>
                                    <View style={[styles.tableCell, { width: '15%' }]}>
                                        <Text style={styles.tableCellHeader}>FASE 2</Text>
                                    </View>
                                    <View style={[styles.tableCell, { width: '85%', borderRightWidth: 0 }]}>
                                        <Text style={styles.tableCellHeader}>Tratamiento de ortodoncia y detalle</Text>
                                    </View>
                                </View>

                                {/* Dynamic Rows for Phase 2 */}
                                {(data.s14_f2_filas || []).map((fila, i, arr) => (
                                    <View key={`f2-${i}`} style={[styles.tableRow, { borderBottomWidth: i === arr.length - 1 ? 0 : 1 }]}>
                                        <View style={[styles.tableCell, { width: '15%' }]}>
                                            <Text style={[styles.tableCellValue, { textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                                                {fila.categoria?.toUpperCase() || ''}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '85%', borderRightWidth: 0 }]}>
                                            <Text style={[styles.tableCellValue, { lineHeight: 1.3 }]}>{fila.tratamiento_detalle || '—'}</Text>
                                        </View>
                                    </View>
                                ))}
                                {(data.s14_f2_filas || []).length === 0 && (
                                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                                        <View style={[styles.tableCell, { width: '15%' }]}>
                                            <Text style={[styles.tableCellValue, { textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                                                Ortodoncia
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '85%', borderRightWidth: 0 }]}>
                                            <Text style={styles.tableCellValue}>—</Text>
                                        </View>
                                    </View>
                                )}
                            </View>


                            {/* Análisis Clínico - Radiográfico (Images) */}
                            <View style={{ marginTop: 15 }} wrap={false}>
                                <View style={{ flexDirection: 'row', border: '1 solid #000', height: 120 }}>
                                    <View style={{ width: '20%', borderRight: '1 solid #000', justifyContent: 'center', padding: 5 }}>
                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
                                            Análisis clínico - radiográfico
                                        </Text>
                                    </View>
                                    <View style={{ width: '80%', flexDirection: 'row' }}>
                                        {Array.from({ length: 3 }).map((_, i) => {
                                            const img = (data.s14_justificacion_imagenes || [])[i];
                                            return (
                                                <View key={i} style={{ flex: 1, borderRight: i < 2 ? '1 solid #000' : 'none', padding: 2 }}>
                                                    {img && <Image src={img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            {/* Recomendaciones e indicaciones */}
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Recomendaciones e indicaciones:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: 'justify' }}>
                                    - Estos aparatos requieren de buena higiene bucal{'\n'}
                                    - Cuando se los instala provocan malestar, dolor por un periodo de una semana hasta la adaptación, algunos niños no comen, y otros intentan despegarlos si es fijo y en removible no se lo colocan.{'\n'}
                                    - Puede provocar dificultad para hablar por un periodo transitorio
                                </Text>
                            </View>

                            {/* Warning Message */}
                            <View style={{ marginTop: 20, marginBottom: 30, alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-BoldOblique', textAlign: 'center', textDecoration: 'underline' }}>
                                    Recuerde que es un tratamiento de un año mínimo, y de mucha
                                </Text>
                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-BoldOblique', textAlign: 'center', textDecoration: 'underline', marginTop: 2 }}>
                                    paciencia no se desespere.
                                </Text>
                            </View>

                            {/* Custom Signatures for Mode 2 */}
                            <View style={{ marginTop: 20 }} wrap={false}>
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ fontSize: 9 }}>Firma de responsabilidad______________________________</Text>
                                </View>
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ fontSize: 9 }}>Representante ______________________________________</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {/* MODE 3: PRESUPUESTO ORTOPEDIA PERSONALIZADO */}
                    {mode === 3 && (
                        <View style={{ padding: 20 }}>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 10, borderBottom: '2 solid #000', paddingBottom: 5 }}>
                                    PRESUPUESTO ORTOPEDIA PERSONALIZADO
                                </Text>
                            </View>

                            {/* Patient Info snippet */}
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 9 }}>Paciente: {data.nombre || data.nombre_paciente || '____________________'}</Text>
                                <Text style={{ fontSize: 9 }}>Edad: {data.edad || '____'} años</Text>
                            </View>

                            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>JUSTIFICACIÓN</Text>

                            {/* Budget Table */}
                            <View style={{ border: '1 solid #000', marginBottom: 15 }} wrap={false}>
                                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderBottom: '1 solid #000' }}>
                                    <View style={{ width: '25%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Tratamiento</Text></View>
                                    <View style={{ width: '35%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Aparato ortopédico bimaxilar (mandíbula y maxilar)</Text></View>
                                    <View style={{ width: '20%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Abono</Text></View>
                                    <View style={{ width: '20%', padding: 5 }}><Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Total</Text></View>
                                </View>
                                <View style={{ flexDirection: 'row', borderBottom: '1 solid #000', minHeight: 60 }}>
                                    <View style={{ width: '25%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 8 }}>{data.s15_ppto_tratamiento}</Text></View>
                                    <View style={{ width: '35%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 8 }}>{data.s15_ppto_aparato}</Text></View>
                                    <View style={{ width: '20%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 8 }}>{data.s15_ppto_abono}</Text></View>
                                    <View style={{ width: '20%', padding: 5 }}><Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{data.s15_ppto_total}</Text></View>
                                </View>
                                <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                                    <View style={{ width: '25%', borderRight: '1 solid #000', padding: 5 }}><Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>NOTA</Text></View>
                                    <View style={{ width: '75%', padding: 5 }}><Text style={{ fontSize: 8 }}>{data.s15_ppto_note || data.s15_ppto_nota}</Text></View>
                                </View>
                            </View>

                            {/* Personalized Justification */}
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: 'justify' }}>
                                    {data.s15_indicaciones_paciente}
                                </Text>
                            </View>

                            {/* Static ORTOPEDIA Content */}
                            <View wrap={false}>
                                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>ORTOPEDIA</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: 'justify', marginBottom: 10 }}>
                                    Corrección con aparatos fijos o removibles, indicado para, malas mordidas y algunos dientes inclinados o “montados”, los mismos que pueden alinearse consiguiendo buena posición y corrigiendo el defecto óseo (hueso).
                                </Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: 'justify', marginBottom: 15 }}>
                                    Los pacientes requieren de una fase y otros de 2 fases, que se evalúa según la respuesta al uso de los aparatos, además cuando desarrolle la dentición permanente, puede necesitar tratamiento complementario de ortodoncia (bracktes) depende el caso.
                                </Text>

                                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Recomendaciones e indicaciones:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: 'justify', marginBottom: 15 }}>
                                    - Estos aparatos requieren de buena higiene bucal{"\n"}
                                    - Cuando se los instala provocan malestar, dolor por un periodo de una semana hasta la adaptación, algunos niños no comen, y otros intentan despegarlos si es fijo y en removible no se lo colocan.
                                </Text>

                                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-BoldOblique', textDecoration: 'underline' }}>
                                        Recuerde que es un tratamiento de un año mínimo, y de mucha
                                    </Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-BoldOblique', textDecoration: 'underline' }}>
                                        paciencia no se desespere.
                                    </Text>
                                </View>
                            </View>

                            {/* Signatures */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }} wrap={false}>
                                <View style={{ borderTop: '1 solid #000', width: '40%', paddingTop: 5 }}>
                                    <Text style={{ fontSize: 9, textAlign: 'center' }}>Representante</Text>
                                </View>
                                <View style={{ borderTop: '1 solid #000', width: '40%', paddingTop: 5 }}>
                                    <Text style={{ fontSize: 9, textAlign: 'center' }}>Firma de responsabilidad</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {/* MODE 4: REGISTRO DE PAGO POR TRATAMIENTO DE ORTOPEDIA */}
                    {mode === 4 && (
                        <View style={{ padding: 20 }}>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 5 }}>
                                    REGISTRO DE PAGO POR TRATAMIENTO DE ORTOPEDIA
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>FECHA:</Text>
                                    <View style={{ borderBottom: '1 solid #000', width: 80, paddingLeft: 5 }}>
                                        <Text style={{ fontSize: 9 }}>{data.s16_ppto_fecha || '____/____/____'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 10 }}>PACIENTE:</Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', borderBottom: '1 solid #000', flex: 1 }}>{data.nombre || '____________________'}</Text>
                                </View>
                                <View style={{ width: 100, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 10 }}>EDAD:</Text>
                                    <Text style={{ fontSize: 10, borderBottom: '1 solid #000', flex: 1, textAlign: 'center' }}>{data.edad || '____'}</Text>
                                    <Text style={{ fontSize: 10 }}>años</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 9 }}>VALOR CORRESPONDIENTE POR TRATAMIENTO DE ORTOPEDIA</Text>
                                </View>
                                <View style={{ width: 100, flexDirection: 'row', justifyContent: 'flex-end', gap: 5 }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>$</Text>
                                    <Text style={{ fontSize: 10, borderBottom: '1 solid #000', width: 60, textAlign: 'center' }}>{data.s16_ppto_total_tratamiento}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 15, gap: 10, alignItems: 'flex-end' }}>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>TIEMPO ESTIMADO DE TRATAMIENTO__</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_ppto_tiempo_estimado}</Text>
                                </View>
                                <View style={{ width: 150, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>CUOTA MENSUAL $</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1, textAlign: 'center' }}>{data.s16_ppto_cuota_mensual}</Text>
                                </View>
                            </View>

                            {/* Payment Table */}
                            <View style={{ border: '1 solid #000' }}>
                                {/* Header Row */}
                                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderBottom: '1 solid #000', minHeight: 25, alignItems: 'center' }}>
                                    <View style={{ width: '8%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}></Text></View>
                                    <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>FECHA</Text></View>
                                    <View style={{ width: '31%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>MES DE CONTROL</Text></View>
                                    <View style={{ width: '13%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>VALOR</Text></View>
                                    <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>FORMA{"\n"}DE PAGO</Text></View>
                                    <View style={{ width: '14%', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>FIRMA</Text></View>
                                </View>

                                {/* Payment Rows */}
                                {data.s16_ppto_pagos_filas?.map((row, index) => (
                                    <View key={index} style={{ flexDirection: 'row', borderBottom: index === data.s16_ppto_pagos_filas.length - 1 ? '0' : '1 solid #000', minHeight: 22, alignItems: 'center' }}>
                                        <View style={{ width: '8%', borderRight: '1 solid #000', padding: 2, backgroundColor: index === 0 ? '#666' : '#CCCCCC', height: '100%', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 8, textAlign: 'center', color: index === 0 ? '#FFF' : '#000' }}>{index + 1}</Text>
                                        </View>
                                        <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}>{row.fecha}</Text></View>
                                        <View style={{ width: '31%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}>{row.mes}</Text></View>
                                        <View style={{ width: '13%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}>{row.valor}</Text></View>
                                        <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}>{row.forma_pago}</Text></View>
                                        <View style={{ width: '14%', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}></Text></View>
                                    </View>
                                ))}
                            </View>

                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 5 }}>
                                <Text style={{ fontSize: 10 }}>APARATO ORTOPEDICO</Text>
                                <Text style={{ fontSize: 10, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_ppto_aparato_footer}</Text>
                            </View>
                        </View>
                    )}

                    {/* MODE 5: REGISTRO DE PROCEDIMIENTO POR TRATAMIENTO DE ORTOPEDIA */}
                    {mode === 5 && (
                        <View style={{ padding: 20 }}>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 5 }}>
                                    REGISTRO DE PROCEDIMIENTO POR TRATAMIENTO DE ORTOPEDIA
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>FECHA:</Text>
                                    <View style={{ borderBottom: '1 solid #000', width: 80, paddingLeft: 5 }}>
                                        <Text style={{ fontSize: 9 }}>{data.s16_proc_fecha || '____/____/____'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 10 }}>PACIENTE:</Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', borderBottom: '1 solid #000', flex: 1 }}>{data.nombre || '____________________'}</Text>
                                </View>
                                <View style={{ width: 100, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 10 }}>EDAD:</Text>
                                    <Text style={{ fontSize: 10, borderBottom: '1 solid #000', flex: 1, textAlign: 'center' }}>{data.edad || '____'}</Text>
                                    <Text style={{ fontSize: 10 }}>años</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 5 }}>
                                <Text style={{ fontSize: 9 }}>APARATOS ORTOPEDICOS</Text>
                                <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_aparatos || '________________________________________________'}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>UNMAXILAR</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_unmaxilar}</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>BIMAXILAR</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_bimaxilar}</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontSize: 9 }}>AUXILIARES</Text>
                                    <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_auxiliares}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 15, gap: 5 }}>
                                <Text style={{ fontSize: 9 }}>HALLAZGOS RELEVANTES</Text>
                                <Text style={{ fontSize: 9, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_hallazgos}</Text>
                            </View>

                            {/* Procedure Table */}
                            <View style={{ border: '1 solid #000' }}>
                                {/* Header Row */}
                                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderBottom: '1 solid #000', minHeight: 25, alignItems: 'center' }}>
                                    <View style={{ width: '8%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, textAlign: 'center' }}></Text></View>
                                    <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>FECHA</Text></View>
                                    <View style={{ width: '25%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>MES DE CONTROL</Text></View>
                                    <View style={{ width: '50%', padding: 2 }}><Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>OBSERVACIONES</Text></View>
                                </View>

                                {/* Procedure Rows */}
                                {data.s16_proc_filas?.map((row, index) => (
                                    <View key={index} wrap={false} style={{ flexDirection: 'row', borderBottom: index === data.s16_proc_filas.length - 1 ? '0' : '1 solid #000', alignItems: 'stretch' }}>
                                        <View style={{ width: '8%', borderRight: '1 solid #000', padding: 2, backgroundColor: index === 0 ? '#666' : '#CCCCCC', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 7, textAlign: 'center', color: index === 0 ? '#FFF' : '#000' }}>{index + 1}</Text>
                                        </View>
                                        <View style={{ width: '17%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 7, textAlign: 'center' }}>{row.fecha}</Text></View>
                                        <View style={{ width: '25%', borderRight: '1 solid #000', padding: 2 }}><Text style={{ fontSize: 7, textAlign: 'center' }}>{row.mes}</Text></View>
                                        <View style={{ width: '50%', padding: 2 }}><Text style={{ fontSize: 7, textAlign: 'left' }}>{row.observaciones}</Text></View>
                                    </View>
                                ))}
                            </View>

                            <View style={{ marginTop: 10, flexDirection: 'row', gap: 5 }}>
                                <Text style={{ fontSize: 10 }}>OBJETIVOS</Text>
                                <Text style={{ fontSize: 10, borderBottom: '1 solid #000', flex: 1 }}>{data.s16_proc_objetivos}</Text>
                            </View>
                        </View>
                    )}

                </View>

                <View style={styles.footer} fixed>
                    <Image src="/pdf-footer.jpg" style={styles.footerImage} />
                </View>
            </Page>
        </Document>
    );
};

export default OrtopediaDocument;
