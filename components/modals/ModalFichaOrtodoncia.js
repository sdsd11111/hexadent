'use client';

import { useState, Fragment, useEffect, useRef } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import ModalGalleryFicha from './ModalGalleryFicha';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    XMarkIcon,
    ChevronUpIcon,
    PlusIcon,
    ClipboardDocumentCheckIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    PhotoIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    FaceSmileIcon,
    ShieldCheckIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

import OrtodonciaDocument from '../pdf/OrtodonciaDocument';
import OdontogramaEditor from '../odontologia/OdontogramaEditor';

const fichaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string().optional(),
    cedula: z.string().min(1, 'La cédula es requerida'),
    edad: z.coerce.number().min(0, 'Edad inválida'),
    sexo: z.enum(['Femenino', 'Masculino', 'Otro']),
    fecha: z.string().default(() => new Date().toISOString().split('T')[0]),
    celular: z.string().optional(),
    telefono_fijo: z.string().optional(),
    direccion: z.string().optional(),
    pais_ciudad: z.string().optional(),
    tutor: z.string().optional().or(z.literal('')).nullable(),
    queja_principal: z.string().optional().or(z.literal('')).nullable(),
    historia_medica: z.string().optional().or(z.literal('')).nullable(),
    historico_accidentes: z.string().optional().or(z.literal('')).nullable(),
    tratamiento_previo: z.enum(['Si', 'No']).optional().or(z.literal('')).nullable(),
    tratamiento_previo_detalle: z.string().optional().or(z.literal('')).nullable(),
    indice_colaboracion: z.enum(['Alto', 'Medio', 'Bajo']).optional().or(z.literal('')).nullable(),
    higiene_oral: z.enum(['Adecuada', 'Deficiente']).optional().or(z.literal('')).nullable(),
    necesidad_tratamiento_general: z.string().optional().or(z.literal('')).nullable(),
    hereditariedad: z.string().optional().or(z.literal('')).nullable(),
    analisis_facial: z.object({
        tipo_facial: z.enum(['Mesofacial', 'Dolicofacial', 'Braquifacial']).optional().or(z.literal('')).nullable(),
        convexidad_facial: z.enum(['Recto', 'Concavo', 'Convexo']).optional().or(z.literal('')).nullable(),
        proporcion_tercios: z.object({
            estado: z.enum(['Proporcionales', 'Sin proporcion aumentados', 'Sin proporcion disminuido']).optional().or(z.literal('')).nullable(),
            superior: z.boolean().optional(),
            inferior: z.boolean().optional(),
            medio: z.boolean().optional(),
        }).optional(),
        sellado_labial: z.enum(['Pasivo', 'Comprensivo']).optional().or(z.literal('')).nullable(),
        relacion_labios: z.enum(['Superior delante', 'Inferior delante']).optional().or(z.literal('')).nullable(),
        simetria_reposo: z.object({
            estado: z.enum(['Simetrico', 'Asimetrico']).optional().or(z.literal('')).nullable(),
            derecha: z.boolean().optional(),
            izquierda: z.boolean().optional(),
        }).optional(),
        simetria_apertura: z.object({
            estado: z.enum(['Presenta', 'No presenta']).optional().or(z.literal('')).nullable(),
            derecha: z.boolean().optional(),
            izquierda: z.boolean().optional(),
        }).optional(),
        angulo_nasolabial: z.enum(['Normal', 'Abierto', 'Disminuido']).optional().or(z.literal('')).nullable(),
        surco_mentolabial: z.enum(['Normal', 'Profundo', 'Poco Profundo']).optional().or(z.literal('')).nullable(),
        proyeccion_cigomatica: z.enum(['Normal', 'Aumentada', 'Deficiente']).optional().or(z.literal('')).nullable(),
        linea_menton_cuello: z.enum(['Normal', 'Aumentada', 'Disminuida']).optional().or(z.literal('')).nullable(),
        angulo_menton_cuello: z.enum(['Normal', 'Abierto', 'Cerrado']).optional().or(z.literal('')).nullable(),
        patron_facial: z.object({
            tipo: z.enum(['Patron I', 'Patron II', 'Patron III', 'Cara Corta', 'Cara Larga']).optional().or(z.literal('')).nullable(),
            p2_retrusion_mand: z.boolean().optional(),
            p2_protrusion_max: z.boolean().optional(),
            p2_aumento_afai: z.boolean().optional(),
            p2_disminucion_afai: z.boolean().optional(),
            p3_protrusion_mand: z.boolean().optional(),
            p3_retrusion_max: z.boolean().optional(),
            p3_aumento_afai: z.boolean().optional(),
            p3_disminucion_afai: z.boolean().optional(),
        }).optional(),
    }).optional(),
    analisis_oclusal: z.object({
        manipulacion_mandibula: z.enum(['RC = MIH', 'RC != MIH']).optional().or(z.literal('')).nullable(),
        relacion_transversal: z.object({
            tipo: z.enum(['Brodie', 'Normal', 'Mordida cruzada posterior bilateral', 'Mordida cruzada posterior unilateral lado']).optional().or(z.literal('')).nullable(),
            derecho: z.boolean().optional(),
            izquierdo: z.boolean().optional(),
        }).optional(),
        caracteristica_mordida_cruzada: z.enum(['Esqueletal', 'Dento-alveolar', 'No presenta']).optional().or(z.literal('')).nullable(),
        relacion_vertical: z.object({
            tipo: z.enum(['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de']).optional().or(z.literal('')).nullable(),
            milimetros: z.string().optional(),
        }).optional(),
        curva_spee: z.object({
            tipo: z.enum(['Normal', 'Alterada']).optional().or(z.literal('')).nullable(),
            alterada_extrusion_incisivos_inferiores: z.boolean().optional(),
            alterada_extrusion_incisivos_superiores: z.boolean().optional(),
            alterada_intrusion_incisivos: z.boolean().optional(),
            alterada_molares_extruidos: z.boolean().optional(),
            alterada_molares_instruidos: z.boolean().optional(),
        }).optional(),
        relacion_sagital_incisivos: z.object({
            tipo: z.enum(['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de']).optional().or(z.literal('')).nullable(),
            milimetros: z.string().optional(),
        }).optional(),
        relacion_caninos_mih: z.object({
            lado_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
            lado_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
        }).optional(),
        relacion_molares_mih: z.object({
            lado_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
            lado_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
        }).optional(),
        relacion_caninos_rc: z.object({
            lado_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
            lado_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
        }).optional(),
        relacion_molares_rc: z.object({
            lado_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
            lado_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
        }).optional(),
        linea_media: z.object({
            tipo: z.enum(['Coincidentes']).optional().or(z.literal('')).nullable(),
            linea_media_superior_desviada: z.boolean().optional(),
            linea_media_inferior_desviada: z.boolean().optional(),
            milimetros: z.string().optional(),
        }).optional(),
        anomalias_dentales: z.string().optional().or(z.literal('')).nullable(),
        condicion_atm: z.string().optional().or(z.literal('')).nullable(),
        familiar_maloclusion: z.string().optional().or(z.literal('')).nullable(),
    }).optional().or(z.literal('')).nullable(),
    analisis_cefalometrico: z.object({
        bases_apicales: z.string().optional(),
        tendencia_crecimiento: z.string().optional(),
        aspectos_dento_alveolares: z.string().optional(),
    }).optional(),
    diagnostico_funcional: z.object({
        tipo_respiracion: z.enum(['Oral', 'Nasal', 'Oronasal']).optional().or(z.literal('')).nullable(),
        frenillo_labial: z.enum(['Normal', 'Muy inserido']).optional().or(z.literal('')).nullable(),
        ronco: z.enum(['Si', 'No']).optional().or(z.literal('')).nullable(),
        bruxismo: z.enum(['No hay desgastes', 'Hay desgastes moderados en caninos y premolares', 'Hay desgastes severos con envolvimiento de las caras oclusales en dientes posteriores']).optional().or(z.literal('')).nullable(),
    }).optional().or(z.literal('')).nullable(),
    planificacion_tratamiento: z.object({
        lista_problemas: z.string().optional(),
        metas_tratamiento: z.string().optional(),
        secuencia_tratamiento: z.string().optional(),
        posibles_proximas_etapas: z.string().optional(),
    }).optional(),
    plan_tratamiento_final: z.object({
        plan_detallado: z.string().optional(),
        fecha: z.string().default(() => new Date().toISOString().split('T')[0]),
        firma_paciente: z.boolean().optional(),
        firma_doctor: z.boolean().optional(),
    }).optional(),
    motivo_consulta: z.string().optional(),
    enfermedad_actual: z.string().optional(),
    odontograma: z.any().optional(),
    tratamiento: z.array(z.object({
        fecha: z.string().optional(),
        procedimiento: z.string().optional(),
        pago: z.string().optional(),
    })).default([]),
    // New structured fields for separate PDFs
    s16_ppto_fecha: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_total_tratamiento: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_tiempo_estimado: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cuota_mensual: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_costo_brackets_nuevo: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_readhesion: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_extracciones: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_terceros: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_caninos: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_aparato_footer: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_pagos_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        valor: z.string().optional().or(z.literal('')).nullable(),
        forma_pago: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_ppto_total_general: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_perdida_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        valor: z.string().optional().or(z.literal('')).nullable(),
        forma_pago: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_ppto_readhesion_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        valor: z.string().optional().or(z.literal('')).nullable(),
        forma_pago: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    // Cirugia payment fields
    s16_ppto_cirugia_fecha: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_total_tratamiento: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_tiempo_estimado: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_cuota_mensual: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_costo_brackets_nuevo: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_readhesion: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_aparato_footer: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cirugia_pagos_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        valor: z.string().optional().or(z.literal('')).nullable(),
        forma_pago: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_proc_fecha: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_aparatos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_unmaxilar: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_bimaxilar: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_auxiliares: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_hallazgos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_objetivos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        ligas_interm: z.string().optional().or(z.literal('')).nullable(),
        observaciones: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_proc_image1: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_image2: z.string().optional().or(z.literal('')).nullable(),
    // Dynamic Brackets Info
    s16_proc_brackets_filas: z.array(z.object({
        tipo: z.string().optional().or(z.literal('')).nullable(),
        tecnica: z.string().optional().or(z.literal('')).nullable(),
        objetivo: z.string().optional().or(z.literal('')).nullable(),
        forma_arco: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_proc_microtornillos: z.string().optional().or(z.literal('')).nullable(),
    // Extraoral Analysis
    s16_proc_biotipo_facial: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_simetria_cara: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_alineacion: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_tercio_sup: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_tercio_medio: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_tercio_inf: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_perfil: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_altura_sonrisa: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_arco_sonrisa: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_exp_gingival: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_corredores_bucales: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_linea_media_dentaria: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_habitos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_alteraciones_atm: z.string().optional().or(z.literal('')).nullable(),
    // Adhesion Reference (Structured)
    s16_proc_adhesion_u_check: z.boolean().optional().default(false),
    s16_proc_adhesion_u_11: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_12: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_13: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_14: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_15: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_16: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_u_37: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_check: z.boolean().optional().default(false),
    s16_proc_adhesion_l_41_42: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_43: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_44: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_45: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_46: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_adhesion_l_47: z.string().optional().or(z.literal('')).nullable(),
    imagenes: z.array(z.object({
        date: z.string(),
        data: z.array(z.string())
    })).default([]),
    s14_justificacion_clinica: z.string().optional().or(z.literal('')).nullable(),
    s15_indicaciones_paciente: z.string().optional().or(z.literal('')).nullable(),
    s16_registro_pago_ortodoncia: z.string().optional().or(z.literal('')).nullable(),
    // Consentimiento fields
    s16_consent_representante: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_paciente: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_ci: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_edad: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_firma: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_correo: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_telefono: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_direccion: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_costo_total: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_costo_mensual: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_tiempo_estimado: z.string().optional().or(z.literal('')).nullable(),
    s16_consent_acepta_tratamiento: z.boolean().optional().default(false),
    s16_consent_acepta_uso_registros: z.boolean().optional().default(false),
});

export default function ModalFichaOrtodoncia({ isOpen, onClose, onSuccess, editData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [recordId, setRecordId] = useState(null);
    const [pdfData, setPdfData] = useState({});
    const [activeSection, setActiveSection] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectingImageFor, setSelectingImageFor] = useState(null); // 'image1' or 'image2'
    const [mainAccordion, setMainAccordion] = useState(null);
    const [subAccordion, setSubAccordion] = useState(null); // For payment sub-sections: 1 or 2
    const accordionRefs = useRef({});

    const { register, handleSubmit, reset, watch, control, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(fichaSchema),
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            sexo: 'Femenino',
            tratamiento: [{ fecha: new Date().toISOString().split('T')[0], procedimiento: '', pago: '' }],
            imagenes: [],
            s16_ppto_fecha: new Date().toLocaleDateString('es-ES'),
            s16_ppto_pagos_filas: [{
                fecha: new Date().toISOString().split('T')[0],
                mes: 'DIAGNOSTICO/ ANALISIS FOTOS/MODELOS/ RADIOGRAFICO MODELOS DE ESTUDIO ADHESION DE BRACKETS',
                valor: '',
                forma_pago: ''
            }],
            s16_ppto_total_general: '',
            s16_ppto_perdida_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
            s16_ppto_readhesion_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
            s16_ppto_cirugia_total_tratamiento: '',
            s16_ppto_cirugia_tiempo_estimado: '',
            s16_ppto_cirugia_cuota_mensual: '',
            s16_ppto_cirugia_costo_brackets_nuevo: '',
            s16_ppto_cirugia_readhesion: '',
            s16_ppto_cirugia_pagos_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
            s16_proc_brackets_filas: [{ tipo: '', tecnica: '', objetivo: '', forma_arco: '' }],
            s16_proc_fecha: new Date().toISOString().split('T')[0],
            s16_proc_filas: [{
                fecha: '',
                mes: '',
                ligas_interm: '',
                observaciones: ''
            }],
            s16_consent_representante: '',
            s16_consent_ci: '',
            s16_consent_firma: '',
            s16_consent_correo: '',
            s16_consent_telefono: '',
            s16_consent_direccion: '',
            s16_consent_costo_total: '',
            s16_consent_costo_mensual: '',
            s16_consent_tiempo_estimado: '',
            s16_consent_acepta_tratamiento: false,
            s16_consent_acepta_uso_registros: false,
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "tratamiento" });
    const { fields: pagoFields, append: appendPago, remove: removePago } = useFieldArray({ control, name: "s16_ppto_pagos_filas" });
    const { fields: perditaFields, append: appendPerdita, remove: removePerdita } = useFieldArray({ control, name: "s16_ppto_perdida_filas" });
    const { fields: readhesionFields, append: appendReadhesion, remove: removeReadhesion } = useFieldArray({ control, name: "s16_ppto_readhesion_filas" });
    const { fields: pagoCirugiaFields, append: appendPagoCirugia, remove: removePagoCirugia } = useFieldArray({ control, name: "s16_ppto_cirugia_pagos_filas" });
    const { fields: procFields, append: appendProc, remove: removeProc } = useFieldArray({ control, name: "s16_proc_filas" });
    const { fields: bracketFields, append: appendBracket, remove: removeBracket } = useFieldArray({ control, name: "s16_proc_brackets_filas" });

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setRecordId(null);
            reset();
        } else if (editData) {
            setRecordId(editData.id);
            setStep(2);
            reset(editData.data);
            setActiveSection(null);
            setMainAccordion(null);

            // Auto-fill consent form from patient data if consent fields are empty
            setTimeout(() => {
                if (!editData.data.s16_consent_paciente && editData.data.nombre) {
                    const fullName = `${editData.data.nombre || ''} ${editData.data.apellido || ''}`.trim();
                    setValue('s16_consent_paciente', fullName);
                }
                if (!editData.data.s16_consent_ci && editData.data.cedula) {
                    setValue('s16_consent_ci', editData.data.cedula);
                }
                if (!editData.data.s16_consent_edad && editData.data.edad) {
                    setValue('s16_consent_edad', String(editData.data.edad));
                }
            }, 100);

        } else {
            // New Ficha
            setRecordId(null);
            setStep(1);
            reset({
                fecha: new Date().toISOString().split('T')[0],
                sexo: 'Femenino',
                tratamiento: [{ fecha: new Date().toISOString().split('T')[0], procedimiento: '', pago: '' }],
                imagenes: [],
                s16_ppto_fecha: new Date().toLocaleDateString('es-ES'),
                s16_ppto_pagos_filas: [{
                    fecha: new Date().toISOString().split('T')[0],
                    mes: 'DIAGNOSTICO/ ANALISIS FOTOS/MODELOS/ RADIOGRAFICO MODELOS DE ESTUDIO ADHESION DE BRACKETS',
                    valor: '',
                    forma_pago: ''
                }],
                s16_ppto_total_general: '',
                s16_ppto_perdida_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
                s16_ppto_readhesion_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
                s16_ppto_cirugia_total_tratamiento: '',
                s16_ppto_cirugia_tiempo_estimado: '',
                s16_ppto_cirugia_cuota_mensual: '',
                s16_ppto_cirugia_costo_brackets_nuevo: '',
                s16_ppto_cirugia_readhesion: '',
                s16_ppto_cirugia_pagos_filas: [{ fecha: '', mes: '', valor: '', forma_pago: '' }],
                s16_proc_brackets_filas: [{ tipo: '', tecnica: '', objetivo: '', forma_arco: '' }],
                s16_proc_fecha: new Date().toISOString().split('T')[0],
                s16_proc_filas: [{ fecha: '', mes: '', ligas_interm: '', observaciones: '' }],
                s16_consent_representante: '',
                s16_consent_ci: '',
                s16_consent_firma: '',
                s16_consent_correo: '',
                s16_consent_telefono: '',
                s16_consent_direccion: '',
                s16_consent_costo_total: '',
                s16_consent_costo_mensual: '',
                s16_consent_tiempo_estimado: '',
                s16_consent_acepta_tratamiento: false,
                s16_consent_acepta_uso_registros: false,
            });
            setActiveSection(1);
            setMainAccordion(1);
        }
    }, [isOpen, editData, reset]);

    // Scroll to accordion when mainAccordion changes
    useEffect(() => {
        if (mainAccordion !== null && accordionRefs.current[mainAccordion]) {
            setTimeout(() => {
                accordionRefs.current[mainAccordion]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }
    }, [mainAccordion]);


    const formData = watch();

    const refreshPDF = () => {
        let mode = 1;
        if (mainAccordion === 2) mode = 5; // Consentimiento
        else if (mainAccordion === 3) mode = 2; // Procedimientos
        else if (mainAccordion === 4) {
            mode = subAccordion === 2 ? 4 : 3;
        } else {
            mode = mainAccordion || 1;
        }
        setPdfData({ ...JSON.parse(JSON.stringify(formData)), pdfMode: mode });
    };

    useEffect(() => {
        if (isOpen && (editData || recordId)) {
            setPdfData(JSON.parse(JSON.stringify(formData)));
        }
    }, [isOpen, editData, recordId]);

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            const isUpdate = step === 2 && recordId;
            const response = await fetch('/api/fichas', {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fichaType: 'ortodoncia',
                    id: recordId,
                    data: data
                }),
            });

            if (response.ok) {
                const result = await response.json();
                if (step === 1) {
                    setRecordId(result.id);
                    setStep(2);
                    setActiveSection(1);
                    setMainAccordion(1);
                } else {
                    alert('Ficha de Ortodoncia guardada exitosamente');
                    // reset(); // Keep form data
                    onSuccess?.();
                    // onClose(); // Keep modal open
                }
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSection = (sectionId) => {
        setActiveSection(prev => prev === sectionId ? null : sectionId);
    };

    const sections = [
        { id: 1, title: '1. ANÁLISIS GENERAL/ANAMNESIS', icon: UserIcon },
        { id: 2, title: '2. ANÁLISIS FACIAL', icon: FaceSmileIcon },
        { id: 3, title: '3. ANÁLISIS OCLUSAL', icon: CalculatorIcon },
        { id: 4, title: '4. ANÁLISIS CEFALOMÉTRICO', icon: DocumentTextIcon },
        { id: 5, title: '5. DIAGNÓSTICO FUNCIONAL', icon: FaceSmileIcon },
        { id: 6, title: '6. PLANIFICACIÓN DEL TRATAMIENTO', icon: ClipboardDocumentCheckIcon },
        { id: 7, title: '7. PLAN DE TRATAMIENTO FINAL', icon: DocumentTextIcon },
    ];

    const renderSectionFields = (sectionId) => {
        switch (sectionId) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-6 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">1.1. Nombre del paciente *</label>
                                <input {...register('nombre')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Edad</label>
                                <input type="number" {...register('edad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                            <div className="md:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Hexadent ID / Cédula</label>
                                <input {...register('cedula')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">1.2. País y ciudad</label>
                                <input {...register('pais_ciudad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Sexo</label>
                                <select {...register('sexo')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold">
                                    <option value="Femenino">Femenino</option>
                                    <option value="Masculino">Masculino</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">1.3. Nombre del tutor</label>
                                <input {...register('tutor')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Celular Contacto</label>
                                <input {...register('celular')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                        </div>
                        {step === 2 && (
                            <>
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.4 Queja principal</label>
                                        <textarea {...register('queja_principal')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.5 Historia médica</label>
                                        <textarea {...register('historia_medica')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.6 Accidentes o traumas</label>
                                        <textarea {...register('historico_accidentes')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">1.7 ¿Tratamiento previo?</label>
                                    <div className="flex gap-4 items-center">
                                        {['Si', 'No'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2">
                                                <input type="radio" value={opt} {...register('tratamiento_previo')} className="text-orange-600" />
                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                            </label>
                                        ))}
                                        <input {...register('tratamiento_previo_detalle')} placeholder="Detalle..." className="flex-1 p-2 bg-slate-50 border-b outline-none font-bold text-xs" />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">1.8 Índice de colaboración</label>
                                    <div className="flex gap-6">
                                        {['Alto', 'Medio', 'Bajo'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2">
                                                <input type="radio" value={opt} {...register('indice_colaboracion')} className="text-orange-600" />
                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">1.9 Higiene oral:</label>
                                    <div className="flex gap-6">
                                        {['Adecuada', 'Deficiente'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2">
                                                <input type="radio" value={opt} {...register('higiene_oral')} className="text-orange-600" />
                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.10 Nec. tratamiento general</label>
                                        <textarea {...register('necesidad_tratamiento_general')} rows={1} className="w-full p-2 bg-slate-50 border rounded-lg outline-none font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.11 Hereditariedad</label>
                                        <textarea {...register('hereditariedad')} rows={1} className="w-full p-2 bg-slate-50 border rounded-lg outline-none font-bold" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.1. TIPO FACIAL:</label>
                            <div className="flex flex-wrap gap-6 pl-4 border-b pb-3">
                                {['Mesofacial', 'Dolicofacial', 'Braquifacial'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.tipo_facial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.2. CONVEXIDAD FACIAL:</label>
                            <div className="flex flex-wrap gap-6 pl-4 border-b pb-3">
                                {['Recto', 'Concavo', 'Convexo'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.convexidad_facial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.3. PROPORCIÓN TERCIOS:</label>
                            <div className="space-y-3 pl-4 border-b pb-3">
                                <div className="flex flex-col gap-2">
                                    {['Proporcionales', 'Sin proporcion aumentados', 'Sin proporcion disminuido'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.proporcion_tercios.estado')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.4. SELLADO LABIAL:</label>
                            <div className="flex gap-6 pl-4 border-b pb-3">
                                {['Pasivo', 'Comprensivo'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.sellado_labial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.5. RELATION LABIOS:</label>
                            <div className="flex gap-6 pl-4 border-b pb-3">
                                {['Superior delante', 'Inferior delante'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.relacion_labios')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.6. SIMETRÍA REPOSO:</label>
                            <div className="pl-4 border-b pb-3 space-y-2">
                                <div className="flex gap-6">
                                    {['Simetrico', 'Asimetrico'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.simetria_reposo.estado')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-6 ml-4">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" {...register('analisis_facial.simetria_reposo.derecha')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">Derecha</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" {...register('analisis_facial.simetria_reposo.izquierda')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">Izquierda</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.7. SIMETRÍA APERTURA:</label>
                            <div className="pl-4 border-b pb-3 space-y-2">
                                <div className="flex gap-6">
                                    {['Presenta', 'No presenta'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.simetria_apertura.estado')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-6 ml-4">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" {...register('analisis_facial.simetria_apertura.derecha')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">Derecha</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" {...register('analisis_facial.simetria_apertura.izquierda')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">Izquierda</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.8. ÁNGULO NASOLABIAL:</label>
                            <div className="flex gap-6 pl-4 border-b pb-3">
                                {['Normal', 'Abierto', 'Disminuido'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.angulo_nasolabial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.9. SURCO MENTOLABIAL:</label>
                            <div className="flex gap-6 pl-4 border-b pb-3">
                                {['Normal', 'Profundo', 'Poco Profundo'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_facial.surco_mentolabial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">2.10. Proyección Cigomática</label>
                                <div className="flex flex-col gap-1 pl-2">
                                    {['Normal', 'Aumentada', 'Deficiente'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.proyeccion_cigomatica')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">2.11. Línea Mentón-Cuello</label>
                                <div className="flex flex-col gap-1 pl-2">
                                    {['Normal', 'Aumentada', 'Disminuida'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.linea_menton_cuello')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">2.12. Ángulo Mentón-Cuello</label>
                                <div className="flex flex-col gap-1 pl-2">
                                    {['Normal', 'Abierto', 'Cerrado'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.angulo_menton_cuello')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">2.13. PATRÓN FACIAL:</label>
                            <div className="pl-4 pb-3 space-y-4">
                                <div className="flex flex-wrap gap-4">
                                    {['Patron I', 'Patron II', 'Patron III', 'Cara Corta', 'Cara Larga'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_facial.patron_facial.tipo')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Patrón II</p>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p2_retrusion_mand')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Retrusión Mandibular</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p2_protrusion_max')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Protrusión Maxilar</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p2_aumento_afai')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Aumento AFAI</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p2_disminucion_afai')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Disminución AFAI</span></label>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Patrón III</p>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p3_protrusion_mand')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Protrusión Mandibular</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p3_retrusion_max')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Retrusión Maxilar</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p3_aumento_afai')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Aumento AFAI</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_facial.patron_facial.p3_disminucion_afai')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Disminución AFAI</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.1. OCLUSIÓN MANIPULACIÓN:</label>
                            <div className="space-y-2 pl-4">
                                {['RC = MIH', 'RC != MIH'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_oclusal.manipulacion_mandibula')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.2. RELACIÓN TRANSVERSAL:</label>
                            <div className="grid grid-cols-2 gap-4 pl-4">
                                <div className="space-y-2">
                                    {['Brodie', 'Normal', 'Mordida cruzada'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_oclusal.relacion_transversal.tipo')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.relacion_transversal.derecho')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Derecho</span></label>
                                        <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.relacion_transversal.izquierdo')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Izquierdo</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.3. CARACT. MORDIDA CRUZADA:</label>
                            <div className="flex gap-4 pl-4 flex-wrap">
                                {['Esqueletal', 'Dento-alveolar', 'No presenta'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('analisis_oclusal.caracteristica_mordida_cruzada')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.4. RELACIÓN VERTICAL:</label>
                            <div className="pl-4 space-y-2">
                                <div className="flex flex-wrap gap-4">
                                    {['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_oclusal.relacion_vertical.tipo')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">Milímetros:</span>
                                    <input {...register('analisis_oclusal.relacion_vertical.milimetros')} className="w-20 p-1 bg-slate-50 border-b border-slate-300 outline-none text-center font-bold text-xs" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.5. CURVA DE SPEE:</label>
                            <div className="pl-4 space-y-3">
                                <div className="flex gap-6">
                                    {['Normal', 'Alterada'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_oclusal.curva_spee.tipo')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase text-slate-600 bg-slate-50 p-2 rounded">
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.curva_spee.alterada_extrusion_incisivos_inferiores')} className="text-orange-600" /> Extrusión Incisivos Inferiores</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.curva_spee.alterada_extrusion_incisivos_superiores')} className="text-orange-600" /> Extrusión Incisivos Superiores</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.curva_spee.alterada_intrusion_incisivos')} className="text-orange-600" /> Intrusión Incisivos</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.curva_spee.alterada_molares_extruidos')} className="text-orange-600" /> Molares Extruidos</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.curva_spee.alterada_molares_instruidos')} className="text-orange-600" /> Molares Instruidos</label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.6. RELACIÓN SAGITAL:</label>
                            <div className="pl-4 space-y-2">
                                <div className="flex flex-wrap gap-4">
                                    {['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2">
                                            <input type="radio" value={opt} {...register('analisis_oclusal.relacion_sagital_incisivos.tipo')} className="text-orange-600" />
                                            <span className="text-xs font-bold uppercase">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">Milímetros:</span>
                                    <input {...register('analisis_oclusal.relacion_sagital_incisivos.milimetros')} className="w-20 p-1 bg-slate-50 border-b border-slate-300 outline-none text-center font-bold text-xs" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.7. Relación Caninos (MIH)</label>
                                <div className="space-y-2 pl-2">
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Derecho</span>
                                        <select {...register('analisis_oclusal.relacion_caninos_mih.lado_derecho')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Izquierdo</span>
                                        <select {...register('analisis_oclusal.relacion_caninos_mih.lado_izquierdo')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.8. Relación Molares (MIH)</label>
                                <div className="space-y-2 pl-2">
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Derecho</span>
                                        <select {...register('analisis_oclusal.relacion_molares_mih.lado_derecho')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Izquierdo</span>
                                        <select {...register('analisis_oclusal.relacion_molares_mih.lado_izquierdo')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.9. Relación Caninos (RC)</label>
                                <div className="space-y-2 pl-2">
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Derecho</span>
                                        <select {...register('analisis_oclusal.relacion_caninos_rc.lado_derecho')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Izquierdo</span>
                                        <select {...register('analisis_oclusal.relacion_caninos_rc.lado_izquierdo')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.10. Relación Molares (RC)</label>
                                <div className="space-y-2 pl-2">
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Derecho</span>
                                        <select {...register('analisis_oclusal.relacion_molares_rc.lado_derecho')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 block">Izquierdo</span>
                                        <select {...register('analisis_oclusal.relacion_molares_rc.lado_izquierdo')} className="w-full text-xs p-1 bg-slate-50 border rounded"><option value="">Seleccione...</option>{['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">3.11. LÍNEA MEDIA:</label>
                            <div className="space-y-2 pl-4">
                                <label className="flex items-center gap-2"><input type="radio" value="Coincidentes" {...register('analisis_oclusal.linea_media.tipo')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Coincidentes</span></label>
                                <div className="flex gap-6 items-center">
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.linea_media.linea_media_superior_desviada')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Línea Media Superior Desviada</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" {...register('analisis_oclusal.linea_media.linea_media_inferior_desviada')} className="text-orange-600" /><span className="text-xs font-bold uppercase">Línea Media Inferior Desviada</span></label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">Milímetros:</span>
                                    <input {...register('analisis_oclusal.linea_media.milimetros')} className="w-20 p-1 bg-slate-50 border-b border-slate-300 outline-none text-center font-bold text-xs" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.12. Anomalías Dentales</label>
                                <textarea {...register('analisis_oclusal.anomalias_dentales')} rows={2} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.13. Condición ATM (Ruidos, Dolor, Apertura)</label>
                                <textarea {...register('analisis_oclusal.condicion_atm')} rows={2} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">3.14. Familiar con maloclusión similar</label>
                                <textarea {...register('analisis_oclusal.familiar_maloclusion')} rows={2} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold" />
                            </div>
                        </div>
                    </div >
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <textarea {...register('analisis_cefalometrico.bases_apicales')} rows={3} placeholder="Bases apicales..." className="w-full p-3 bg-slate-50 border rounded text-xs" />
                        <textarea {...register('analisis_cefalometrico.tendencia_crecimiento')} rows={3} placeholder="Tendencia crecimiento..." className="w-full p-3 bg-slate-50 border rounded text-xs" />
                        <textarea {...register('analisis_cefalometrico.aspectos_dento_alveolares')} rows={3} placeholder="Aspectos dento-alveolares..." className="w-full p-3 bg-slate-50 border rounded text-xs" />
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">5.1 Tipo de Respiración:</label>
                            <div className="flex gap-4">
                                {['Oral', 'Nasal', 'Oronasal'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('diagnostico_funcional.tipo_respiracion')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">5.2 Frenillo Labial:</label>
                            <div className="flex gap-4">
                                {['Normal', 'Muy inserido'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('diagnostico_funcional.frenillo_labial')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-[9px] text-teal-600 font-bold ml-4">* Examen de la isquemia</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">5.3 ¿Hay ronco durante el sueño?:</label>
                            <div className="flex gap-4">
                                {['Si', 'No'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('diagnostico_funcional.ronco')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">5.4 Bruxismo / Desgastes:</label>
                            <div className="flex flex-col gap-2 pl-4">
                                {[
                                    'No hay desgastes',
                                    'Hay desgastes moderados en caninos y premolares',
                                    'Hay desgastes severos con envolvimiento de las caras oclusales en dientes posteriores'
                                ].map(opt => (
                                    <label key={opt} className="flex items-center gap-2">
                                        <input type="radio" value={opt} {...register('diagnostico_funcional.bruxismo')} className="text-orange-600" />
                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">5</span>
                                Lista de Problemas:
                            </label>
                            <textarea
                                {...register('planificacion_tratamiento.lista_problemas')}
                                rows={4}
                                placeholder="Lista de problemas..."
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">6</span>
                                Metas del Tratamiento:
                            </label>
                            <textarea
                                {...register('planificacion_tratamiento.metas_tratamiento')}
                                rows={4}
                                placeholder="Metas del tratamiento..."
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">7</span>
                                Secuencia del Tratamiento:
                            </label>
                            <textarea
                                {...register('planificacion_tratamiento.secuencia_tratamiento')}
                                rows={4}
                                placeholder="Secuencia del tratamiento..."
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">8</span>
                                Posibles Próximas Etapas:
                            </label>
                            <textarea
                                {...register('planificacion_tratamiento.posibles_proximas_etapas')}
                                rows={4}
                                placeholder="Posibles próximas etapas..."
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-6">
                        <textarea {...register('plan_tratamiento_final.plan_detallado')} rows={10} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Escriba el plan final aquí..." />
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register('plan_tratamiento_final.firma_paciente')} className="text-orange-600" />
                                <span className="text-xs font-bold uppercase text-slate-600">Firma Paciente</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register('plan_tratamiento_final.firma_doctor')} className="text-orange-600" />
                                <span className="text-xs font-bold uppercase text-slate-600">Firma Doctor</span>
                            </label>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderSection = (section) => (
        <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 text-orange-900">
                    <section.icon className="h-5 w-5" />
                    <span className="font-bold uppercase text-sm">{section.title}</span>
                </div>
                <ChevronDownIcon
                    className={`h-5 w-5 text-orange-600 transition-transform duration-200 ${activeSection === section.id ? 'rotate-180' : ''}`}
                />
            </button>
            {activeSection === section.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 text-xs font-semibold uppercase text-slate-700">
                    {renderSectionFields(section.id)}
                </div>
            )}
        </div>
    );

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-[95vw] transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all h-[90vh] flex flex-col">
                            <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg"><ClipboardDocumentCheckIcon className="h-6 w-6 text-white" /></div>
                                    <Dialog.Title className="text-xl font-bold text-white uppercase">
                                        {step === 1 ? 'Nueva Ficha Ortodoncia' : `Ortodoncia: ${formData.nombre || ''}`}
                                    </Dialog.Title>
                                </div>
                                <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2"><XMarkIcon className="h-6 w-6" /></button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 border-r border-slate-200">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        {step === 1 ? (
                                            sections.filter(s => s.id === 1).map(renderSection)
                                        ) : (
                                            <div className="space-y-4">
                                                <div className={`rounded-xl border-2 transition-all ${mainAccordion === 1 ? 'border-orange-500 bg-orange-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                    <button type="button" onClick={() => setMainAccordion(mainAccordion === 1 ? null : 1)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${mainAccordion === 1 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}><DocumentTextIcon className="h-5 w-5" /></div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.1</p>
                                                                <h3 className={`text-sm font-black uppercase ${mainAccordion === 1 ? 'text-orange-700' : 'text-slate-700'}`}>1. Formulario Clínico</h3>
                                                            </div>
                                                        </div>
                                                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 1 ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {mainAccordion === 1 && (
                                                        <div className="px-5 pb-5 space-y-3 pt-2">
                                                            {sections.map(renderSection)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`rounded-xl border-2 transition-all ${mainAccordion === 2 ? 'border-orange-500 bg-orange-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                    <button type="button" onClick={() => setMainAccordion(mainAccordion === 2 ? null : 2)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${mainAccordion === 2 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}><ClipboardDocumentListIcon className="h-5 w-5" /></div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.2</p>
                                                                <h3 className={`text-sm font-black uppercase ${mainAccordion === 2 ? 'text-orange-700' : 'text-slate-700'}`}>2. Consentimiento Informado</h3>
                                                            </div>
                                                        </div>
                                                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 2 ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {mainAccordion === 2 && (
                                                        <div className="px-5 pb-5 pt-2 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Yo (Firmante / Paciente)</label>
                                                                    <input {...register('s16_consent_representante')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="Nombre completo del que firma" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Representante legal de (El Paciente)</label>
                                                                    <input {...register('s16_consent_paciente')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="Nombre del paciente (si aplica)" />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">C.I. / Identificación</label>
                                                                    <input {...register('s16_consent_ci')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Edad (Firmante)</label>
                                                                    <input {...register('s16_consent_edad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Firma (Texto)</label>
                                                                    <input {...register('s16_consent_firma')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50/30 rounded-xl border border-orange-100">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-orange-600 uppercase">Costo Total ($)</label>
                                                                    <input {...register('s16_consent_costo_total')} className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-orange-600 uppercase">Cuota Mensual ($)</label>
                                                                    <input {...register('s16_consent_costo_mensual')} className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-orange-600 uppercase">Tiempo Estimado (Meses)</label>
                                                                    <input {...register('s16_consent_tiempo_estimado')} className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Acepta Costo y Tratamiento</span>
                                                                    <div className="flex gap-2">
                                                                        <button type="button" onClick={() => setValue('s16_consent_acepta_tratamiento', true)} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${watch('s16_consent_acepta_tratamiento') ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>SÍ</button>
                                                                        <button type="button" onClick={() => setValue('s16_consent_acepta_tratamiento', false)} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${!watch('s16_consent_acepta_tratamiento') ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>NO</button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Autoriza Uso de Registros</span>
                                                                    <div className="flex gap-2">
                                                                        <button type="button" onClick={() => setValue('s16_consent_acepta_uso_registros', true)} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${watch('s16_consent_acepta_uso_registros') ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>SÍ</button>
                                                                        <button type="button" onClick={() => setValue('s16_consent_acepta_uso_registros', false)} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${!watch('s16_consent_acepta_uso_registros') ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>NO</button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Correo</label>
                                                                    <input {...register('s16_consent_correo')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                                                                    <input {...register('s16_consent_telefono')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Dirección</label>
                                                                    <input {...register('s16_consent_direccion')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`rounded-xl border-2 transition-all ${mainAccordion === 3 ? 'border-orange-500 bg-orange-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                    <button type="button" onClick={() => setMainAccordion(mainAccordion === 3 ? null : 3)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${mainAccordion === 3 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}><ListBulletIcon className="h-5 w-5" /></div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.3</p>
                                                                <h3 className={`text-sm font-black uppercase ${mainAccordion === 3 ? 'text-orange-700' : 'text-slate-700'}`}>3. PROCEDIMIENTOS REALIZADOS</h3>
                                                            </div>
                                                        </div>
                                                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 3 ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {mainAccordion === 3 && (
                                                        <div className="px-5 pb-5 pt-2 space-y-6">
                                                            {/* Brackets & Microtornillos Box */}
                                                            <div className="flex flex-col md:flex-row gap-4">
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Información de Brackets</label>
                                                                        <button type="button" onClick={() => appendBracket({ tipo: '', tecnica: '', objetivo: '', forma_arco: '' })} className="text-[10px] bg-teal-600 text-white px-2 py-1 rounded-md font-bold hover:bg-teal-700 transition-colors uppercase">
                                                                            + Añadir Fila
                                                                        </button>
                                                                    </div>
                                                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                                        <table className="w-full text-left text-[10px]">
                                                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                                                <tr>
                                                                                    <th className="px-2 py-2 font-black uppercase text-slate-500 border-r border-slate-200">Tipo de Bracketts</th>
                                                                                    <th className="px-2 py-2 font-black uppercase text-slate-500 border-r border-slate-200">Técnica</th>
                                                                                    <th className="px-2 py-2 font-black uppercase text-slate-500 border-r border-slate-200">Objetivo</th>
                                                                                    <th className="px-2 py-2 font-black uppercase text-slate-500 border-r border-slate-200">Forma Arco</th>
                                                                                    <th className="px-2 py-2 w-8"></th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {bracketFields.map((field, index) => (
                                                                                    <tr key={field.id}>
                                                                                        <td className="px-1 py-1 border-r border-slate-200">
                                                                                            <input type="text" {...register(`s16_proc_brackets_filas.${index}.tipo`)} className="w-full p-1 bg-transparent border-none text-[10px] font-bold focus:ring-0" />
                                                                                        </td>
                                                                                        <td className="px-1 py-1 border-r border-slate-200">
                                                                                            <input type="text" {...register(`s16_proc_brackets_filas.${index}.tecnica`)} className="w-full p-1 bg-transparent border-none text-[10px] font-bold focus:ring-0" />
                                                                                        </td>
                                                                                        <td className="px-1 py-1 border-r border-slate-200">
                                                                                            <input type="text" {...register(`s16_proc_brackets_filas.${index}.objetivo`)} className="w-full p-1 bg-transparent border-none text-[10px] font-bold focus:ring-0" />
                                                                                        </td>
                                                                                        <td className="px-1 py-1 border-r border-slate-200">
                                                                                            <input type="text" {...register(`s16_proc_brackets_filas.${index}.forma_arco`)} className="w-full p-1 bg-transparent border-none text-[10px] font-bold focus:ring-0" />
                                                                                        </td>
                                                                                        <td className="px-1 py-1 text-center">
                                                                                            {bracketFields.length > 1 && (
                                                                                                <button type="button" onClick={() => removeBracket(index)} className="text-red-500 hover:text-red-700">
                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                                                </button>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full md:w-32 space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Microtornillos</label>
                                                                    <input type="text" {...register('s16_proc_microtornillos')} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                                                </div>
                                                            </div>

                                                            {/* Analisis Extraoral Section */}
                                                            <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <h4 className="text-[11px] font-black text-center uppercase text-slate-400 border-b pb-2 tracking-widest">Análisis Extraoral</h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Biotipo facial</label>
                                                                        <input type="text" {...register('s16_proc_biotipo_facial')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Simetría de la cara</label>
                                                                        <input type="text" {...register('s16_proc_simetria_cara')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alineación</label>
                                                                        <input type="text" {...register('s16_proc_alineacion')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Perfil</label>
                                                                        <input type="text" {...register('s16_proc_perfil')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Tercio Sup</label><input type="text" {...register('s16_proc_tercio_sup')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold" /></div>
                                                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Tercio Medio</label><input type="text" {...register('s16_proc_tercio_medio')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold" /></div>
                                                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Tercio Inf</label><input type="text" {...register('s16_proc_tercio_inf')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold" /></div>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Altura de Sonrisa</label>
                                                                        <input type="text" {...register('s16_proc_altura_sonrisa')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Arco de Sonrisa</label>
                                                                        <input type="text" {...register('s16_proc_arco_sonrisa')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Exp. Gingival (EG)</label>
                                                                        <input type="text" {...register('s16_proc_exp_gingival')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Corredores Bucales</label>
                                                                        <input type="text" {...register('s16_proc_corredores_bucales')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Línea media dentaria</label>
                                                                        <input type="text" {...register('s16_proc_linea_media_dentaria')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Hábitos a corregir</label>
                                                                        <input type="text" {...register('s16_proc_habitos')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alteraciones ATM</label>
                                                                        <input type="text" {...register('s16_proc_alteraciones_atm')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Adhesion Reference Section */}
                                                            <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <h4 className="text-[11px] font-black text-center uppercase text-slate-400 border-b pb-2 tracking-widest">Adhesión de Bracketts</h4>

                                                                {/* Arco U */}
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold">
                                                                    <span className="uppercase text-slate-500 w-full md:w-auto">Referencia de Adhesión Arco U:</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <input type="checkbox" {...register('s16_proc_adhesion_u_check')} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-3 w-3" />
                                                                        <span>( )</span>
                                                                    </div>
                                                                    {[11, 12, 13, 14, 15, 16, 37].map(num => (
                                                                        <div key={num} className="flex items-center gap-1">
                                                                            <span>{num}</span>
                                                                            <input type="text" {...register(`s16_proc_adhesion_u_${num}`)} className="w-8 p-1 bg-slate-50 border-b border-slate-300 border-t-0 border-l-0 border-r-0 focus:ring-0 text-center font-bold" />
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Arco L */}
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold">
                                                                    <span className="uppercase text-slate-500 w-full md:w-auto">Referencia de Adhesión Arco L:</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <input type="checkbox" {...register('s16_proc_adhesion_l_check')} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-3 w-3" />
                                                                        <span>( )</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span>41/42</span>
                                                                        <input type="text" {...register('s16_proc_adhesion_l_41_42')} className="w-8 p-1 bg-slate-50 border-b border-slate-300 border-t-0 border-l-0 border-r-0 focus:ring-0 text-center font-bold" />
                                                                    </div>
                                                                    {[43, 44, 45, 46, 47].map(num => (
                                                                        <div key={num} className="flex items-center gap-1">
                                                                            <span>{num}</span>
                                                                            <input type="text" {...register(`s16_proc_adhesion_l_${num}`)} className="w-8 p-1 bg-slate-50 border-b border-slate-300 border-t-0 border-l-0 border-r-0 focus:ring-0 text-center font-bold" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                                <table className="w-full text-left border-collapse bg-white text-[10px]">
                                                                    <thead>
                                                                        <tr className="bg-slate-100 border-b border-slate-200">
                                                                            <th className="px-4 py-3 font-black uppercase text-slate-600 border-r border-slate-200 w-12 text-center">N°</th>
                                                                            <th className="px-4 py-3 font-black uppercase text-slate-600 border-r border-slate-200 w-24">Fecha</th>
                                                                            <th className="px-4 py-3 font-black uppercase text-slate-600 border-r border-slate-200">Procedimiento</th>
                                                                            <th className="px-4 py-3 font-black uppercase text-slate-600 border-r border-slate-200 w-32">Ligas Interm.</th>
                                                                            <th className="px-4 py-3 font-black uppercase text-slate-600">Observaciones</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {procFields.map((field, index) => (
                                                                            <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                <td className="px-4 py-2 font-bold text-slate-400 border-r border-slate-200 text-center">{index + 1}</td>
                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                    <input type="date" {...register(`s16_proc_filas.${index}.fecha`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                </td>
                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                    <input type="text" {...register(`s16_proc_filas.${index}.mes`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="PROCEDIMIENTO" />
                                                                                </td>
                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                    <input type="text" {...register(`s16_proc_filas.${index}.ligas_interm`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="LIGAS" />
                                                                                </td>
                                                                                <td className="px-2 py-1">
                                                                                    <input type="text" {...register(`s16_proc_filas.${index}.observaciones`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <div className="px-4 py-3 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl flex justify-between items-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => appendProc({ fecha: '', mes: '', ligas_interm: '', observaciones: '' })}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-[10px] font-bold uppercase"
                                                                >
                                                                    <PlusIcon className="h-4 w-4" />
                                                                    Añadir Fila
                                                                </button>
                                                                {procFields.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeProc(procFields.length - 1)}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4" />
                                                                        Eliminar Última
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Images for PDF Section */}
                                                            <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <h4 className="text-[11px] font-black text-center uppercase text-slate-400 border-b pb-2 tracking-widest">Imágenes para el PDF (Final de Tabla)</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                                                    <div className="space-y-2 p-3 border border-dashed border-slate-200 rounded-lg">
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">📸 Imagen Izquierda (PDF)</label>
                                                                        <div className="aspect-video bg-slate-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-slate-200">
                                                                            {watch('s16_proc_image1') ? (
                                                                                <img src={watch('s16_proc_image1')} alt="Preview" className="w-full h-full object-contain" />
                                                                            ) : (
                                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">Vista Previa - Izquierda</span>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectingImageFor('image1'); setIsGalleryOpen(true); }}
                                                                            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-[10px] font-bold uppercase flex items-center justify-center gap-2"
                                                                        >
                                                                            <PhotoIcon className="h-4 w-4" />
                                                                            Seleccionar de Galería
                                                                        </button>
                                                                        {watch('s16_proc_image1') && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setValue('s16_proc_image1', '')}
                                                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                                                                            >
                                                                                Limpiar
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2 p-3 border border-dashed border-slate-200 rounded-lg">
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">📸 Imagen Derecha (PDF)</label>
                                                                        <div className="aspect-video bg-slate-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-slate-200">
                                                                            {watch('s16_proc_image2') ? (
                                                                                <img src={watch('s16_proc_image2')} alt="Preview" className="w-full h-full object-contain" />
                                                                            ) : (
                                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">Vista Previa - Derecha</span>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectingImageFor('image2'); setIsGalleryOpen(true); }}
                                                                            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-[10px] font-bold uppercase flex items-center justify-center gap-2"
                                                                        >
                                                                            <PhotoIcon className="h-4 w-4" />
                                                                            Seleccionar de Galería
                                                                        </button>
                                                                        {watch('s16_proc_image2') && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setValue('s16_proc_image2', '')}
                                                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                                                                            >
                                                                                Limpiar
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-[9px] text-slate-400 italic text-center">Selecciona imágenes de la galería del cliente para que aparezcan al final de la tabla en el PDF.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`rounded-xl border-2 transition-all ${mainAccordion === 4 ? 'border-orange-500 bg-orange-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                    <button type="button" onClick={() => setMainAccordion(mainAccordion === 4 ? null : 4)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${mainAccordion === 4 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}><ShieldCheckIcon className="h-5 w-5" /></div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.4</p>
                                                                <h3 className={`text-sm font-black uppercase ${mainAccordion === 4 ? 'text-orange-700' : 'text-slate-700'}`}>4. Registro de pago</h3>
                                                            </div>
                                                        </div>
                                                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 4 ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {mainAccordion === 4 && (
                                                        <div className="px-5 pb-5 pt-2 space-y-4">
                                                            {/* Sub-Accordion 3.1: Ortodoncia */}
                                                            <div className={`rounded-xl border-2 transition-all ${subAccordion === 1 ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 bg-white'}`}>
                                                                <button type="button" onClick={() => setSubAccordion(subAccordion === 1 ? null : 1)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                                                                    <span className="text-xs font-black uppercase text-slate-600">3.1 REGISTRO DE PAGO POR TRATAMIENTO DE ORTODONCIA</span>
                                                                    <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${subAccordion === 1 ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {subAccordion === 1 && (
                                                                    <div className="px-4 pb-4 space-y-4">
                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha</label>
                                                                                <input type="date" {...register('s16_ppto_fecha')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Total Tratamiento</label>
                                                                                <input type="text" {...register('s16_ppto_total_tratamiento')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tiempo Estimado</label>
                                                                                <input type="text" {...register('s16_ppto_tiempo_estimado')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cuota Mensual</label>
                                                                                <input type="text" {...register('s16_ppto_cuota_mensual')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Costo Brackets Nuevo</label>
                                                                                <input type="text" {...register('s16_ppto_costo_brackets_nuevo')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Readhesion pasado 6 meses</label>
                                                                                <input type="text" {...register('s16_ppto_readhesion')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1 md:col-span-2">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tratamiento con Extracciones</label>
                                                                                <input type="text" {...register('s16_ppto_extracciones')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1 md:col-span-2">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cirugia de Terceros Molares</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_terceros')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1 md:col-span-2">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Caninos</label>
                                                                                <input type="text" {...register('s16_ppto_caninos')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                        </div>

                                                                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                                            <table className="w-full text-left border-collapse bg-white">
                                                                                <thead>
                                                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200 w-12 text-center">N°</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Fecha</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Mes</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Valor</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Forma de Pago</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {pagoFields.map((field, index) => (
                                                                                        <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                            <td className="px-4 py-2 text-xs font-bold text-slate-400 border-r border-slate-200 text-center">{index + 1}</td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="date" {...register(`s16_ppto_pagos_filas.${index}.fecha`)} className="w-full p-1 bg-transparent border-none text-xs font-bold focus:ring-0" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="text" {...register(`s16_ppto_pagos_filas.${index}.mes`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="MES" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="text" {...register(`s16_ppto_pagos_filas.${index}.valor`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" placeholder="$" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1">
                                                                                                <input type="text" {...register(`s16_ppto_pagos_filas.${index}.forma_pago`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    <tr className="bg-slate-50 font-black">
                                                                                        <td colSpan="3" className="px-4 py-2 text-[10px] uppercase text-slate-600 border-r border-slate-200 text-right">TOTAL</td>
                                                                                        <td className="px-2 py-1 border-r border-slate-200">
                                                                                            <input type="text" {...register('s16_ppto_total_general')} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" placeholder="$ TOTAL" />
                                                                                        </td>
                                                                                        <td className="px-2 py-1"></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>

                                                                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl flex justify-between items-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => appendPago({ fecha: '', mes: '', valor: '', forma_pago: '' })}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-[10px] font-bold uppercase"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                Añadir Fila
                                                                            </button>
                                                                            {pagoFields.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removePago(pagoFields.length - 1)}
                                                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                                                                                >
                                                                                    <XMarkIcon className="h-4 w-4" />
                                                                                    Eliminar Última
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Perdida de Brackets */}
                                                                        <div className="space-y-2">
                                                                            <div className="bg-slate-100 p-2 rounded-t-lg border-x border-t border-slate-200">
                                                                                <span className="text-[10px] font-black uppercase text-slate-600">COSTO ADICIONAL POR PERDIDA DE BRACKETS- TUBOS</span>
                                                                            </div>
                                                                            <div className="border border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
                                                                                <table className="w-full text-left border-collapse bg-white">
                                                                                    <thead>
                                                                                        <tr className="bg-slate-50 border-b border-slate-200">
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200 w-12 text-center">N°</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Fecha</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Descripción</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Valor</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600">Firma</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {perditaFields.map((field, index) => (
                                                                                            <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                                <td className="px-4 py-1.5 text-xs font-bold text-slate-400 border-r border-slate-200 text-center">{index + 1}</td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="date" {...register(`s16_ppto_perdida_filas.${index}.fecha`)} className="w-full p-1 bg-transparent border-none text-xs font-bold focus:ring-0" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="text" {...register(`s16_ppto_perdida_filas.${index}.mes`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="MOTIVO" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="text" {...register(`s16_ppto_perdida_filas.${index}.valor`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" placeholder="$" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1">
                                                                                                    <input type="text" {...register(`s16_ppto_perdida_filas.${index}.forma_pago`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                                                                    <button type="button" onClick={() => appendPerdita({ fecha: '', mes: '', valor: '', forma_pago: '' })} className="text-[10px] font-bold text-teal-600 uppercase hover:text-teal-700 flex items-center gap-1">
                                                                                        <PlusIcon className="h-3 w-3" /> Añadir
                                                                                    </button>
                                                                                    {perditaFields.length > 1 && (
                                                                                        <button type="button" onClick={() => removePerdita(perditaFields.length - 1)} className="text-[10px] font-bold text-red-600 uppercase hover:text-red-700 flex items-center gap-1">
                                                                                            <XMarkIcon className="h-3 w-3" /> Eliminar
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Readhesion de Brackets */}
                                                                        <div className="space-y-2">
                                                                            <div className="bg-slate-100 p-2 rounded-t-lg border-x border-t border-slate-200">
                                                                                <span className="text-[10px] font-black uppercase text-slate-600">READHESION DE BRACKETS</span>
                                                                            </div>
                                                                            <div className="border border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
                                                                                <table className="w-full text-left border-collapse bg-white">
                                                                                    <thead>
                                                                                        <tr className="bg-slate-50 border-b border-slate-200">
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200 w-12 text-center">N°</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Fecha</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Descripción</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Valor</th>
                                                                                            <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-600">Firma</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {readhesionFields.map((field, index) => (
                                                                                            <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                                <td className="px-4 py-1.5 text-xs font-bold text-slate-400 border-r border-slate-200 text-center">{index + 1}</td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="date" {...register(`s16_ppto_readhesion_filas.${index}.fecha`)} className="w-full p-1 bg-transparent border-none text-xs font-bold focus:ring-0" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="text" {...register(`s16_ppto_readhesion_filas.${index}.mes`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="MOTIVO" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1 border-r border-slate-200">
                                                                                                    <input type="text" {...register(`s16_ppto_readhesion_filas.${index}.valor`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" placeholder="$" />
                                                                                                </td>
                                                                                                <td className="px-2 py-1">
                                                                                                    <input type="text" {...register(`s16_ppto_readhesion_filas.${index}.forma_pago`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                                                                    <button type="button" onClick={() => appendReadhesion({ fecha: '', mes: '', valor: '', forma_pago: '' })} className="text-[10px] font-bold text-teal-600 uppercase hover:text-teal-700 flex items-center gap-1">
                                                                                        <PlusIcon className="h-3 w-3" /> Añadir
                                                                                    </button>
                                                                                    {readhesionFields.length > 1 && (
                                                                                        <button type="button" onClick={() => removeReadhesion(readhesionFields.length - 1)} className="text-[10px] font-bold text-red-600 uppercase hover:text-red-700 flex items-center gap-1">
                                                                                            <XMarkIcon className="h-3 w-3" /> Eliminar
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nota de Aparato / Otros</label>
                                                                            <input type="text" {...register('s16_ppto_aparato_footer')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Sub-Accordion 3.2: Ortodoncia + Cirugia */}
                                                            <div className={`rounded-xl border-2 transition-all ${subAccordion === 2 ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 bg-white'}`}>
                                                                <button type="button" onClick={() => setSubAccordion(subAccordion === 2 ? null : 2)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                                                                    <span className="text-xs font-black uppercase text-slate-600">3.2 REGISTRO DE PAGO POR TRATAMIENTO DE ORTODONCIA Y CIRUGIA</span>
                                                                    <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${subAccordion === 2 ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {subAccordion === 2 && (
                                                                    <div className="px-4 pb-4 space-y-4">
                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha</label>
                                                                                <input type="date" {...register('s16_ppto_cirugia_fecha')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Total Tratamiento</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_total_tratamiento')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tiempo Estimado</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_tiempo_estimado')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cuota Mensual</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_cuota_mensual')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Costo Brackets Nuevo</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_costo_brackets_nuevo')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Readhesion pasado 6 meses</label>
                                                                                <input type="text" {...register('s16_ppto_cirugia_readhesion')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                            </div>
                                                                        </div>

                                                                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                                            <table className="w-full text-left border-collapse bg-white">
                                                                                <thead>
                                                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200 w-12 text-center">N°</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Fecha</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Mes</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 border-r border-slate-200">Valor</th>
                                                                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Forma de Pago</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {pagoCirugiaFields.map((field, index) => (
                                                                                        <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                            <td className="px-4 py-2 text-xs font-bold text-slate-400 border-r border-slate-200 text-center">{index + 1}</td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="date" {...register(`s16_ppto_cirugia_pagos_filas.${index}.fecha`)} className="w-full p-1 bg-transparent border-none text-xs font-bold focus:ring-0" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="text" {...register(`s16_ppto_cirugia_pagos_filas.${index}.mes`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 uppercase" placeholder="MES" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1 border-r border-slate-200">
                                                                                                <input type="text" {...register(`s16_ppto_cirugia_pagos_filas.${index}.valor`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" placeholder="$" />
                                                                                            </td>
                                                                                            <td className="px-2 py-1">
                                                                                                <input type="text" {...register(`s16_ppto_cirugia_pagos_filas.${index}.forma_pago`)} className="w-full p-1 bg-transparent border-none text-[11px] font-bold focus:ring-0" />
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>

                                                                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl flex justify-between items-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => appendPagoCirugia({ fecha: '', mes: '', valor: '', forma_pago: '' })}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-[10px] font-bold uppercase"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                Añadir Fila
                                                                            </button>
                                                                            {pagoCirugiaFields.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removePagoCirugia(pagoCirugiaFields.length - 1)}
                                                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                                                                                >
                                                                                    <XMarkIcon className="h-4 w-4" />
                                                                                    Eliminar Última
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nota de Aparato / Otros</label>
                                                                            <input type="text" {...register('s16_ppto_cirugia_aparato_footer')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button type="button" onClick={() => setIsGalleryOpen(true)} className="w-full h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center border-slate-300 hover:bg-orange-50">
                                                    <PhotoIcon className="h-6 w-6 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">ABRIR GALERÍA DE IMÁGENES ({watch('imagenes')?.length || 0})</span>
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>

                                <div className={`${step === 1 ? 'hidden' : 'hidden lg:flex'} w-[40%] bg-slate-800 flex flex-col p-4 relative`}>
                                    <div className="absolute top-6 right-6 z-10 flex gap-2">
                                        <button type="button" onClick={refreshPDF} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95">
                                            <ArrowPathIcon className="h-4 w-4" /> ACTUALIZAR VISTA
                                        </button>
                                    </div>
                                    <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-inner relative">
                                        <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                                            <OrtodonciaDocument
                                                data={pdfData}
                                                mode={pdfData.pdfMode || (mainAccordion === 4 && subAccordion === 2 ? 4 : (mainAccordion === 2 ? 5 : (mainAccordion === 3 ? 2 : (mainAccordion || 1))))}
                                            />
                                        </PDFViewer>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-white border-t flex justify-end gap-4 shadow-upper">
                                <button onClick={onClose} className="px-6 py-2 border rounded-xl font-bold uppercase text-xs">Cancelar</button>
                                {step === 2 && (
                                    <PDFDownloadLink
                                        document={<OrtodonciaDocument data={pdfData} mode={pdfData.pdfMode || (mainAccordion === 4 && subAccordion === 2 ? 4 : (mainAccordion === 2 ? 5 : (mainAccordion === 3 ? 2 : (mainAccordion || 1))))} />}
                                        fileName={
                                            mainAccordion === 2 ? `ortodoncia-consentimiento-${formData.nombre || 'paciente'}.pdf` :
                                                mainAccordion === 3 ? `ortodoncia-procedimientos-${formData.nombre || 'paciente'}.pdf` :
                                                    mainAccordion === 4 ? (
                                                        subAccordion === 2 ? `ortodoncia-pagos-cirugia-${formData.nombre || 'paciente'}.pdf` : `ortodoncia-pagos-${formData.nombre || 'paciente'}.pdf`
                                                    ) :
                                                        `ortodoncia-clinica-${formData.nombre || 'paciente'}.pdf`
                                        }
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold uppercase text-xs"
                                    >
                                        {({ loading }) => loading ? 'Procesando...' :
                                            mainAccordion === 2 ? 'Descargar Consentimiento' :
                                                mainAccordion === 3 ? 'Descargar Procedimientos' :
                                                    mainAccordion === 4 ? (
                                                        subAccordion === 2 ? 'Descargar Pagos Cirugía' : 'Descargar Pagos'
                                                    ) :
                                                        'Descargar Formulario Clínico'
                                        }
                                    </PDFDownloadLink>
                                )}
                                <button onClick={handleSubmit(onSubmit)} className="px-8 py-2 bg-orange-600 text-white rounded-xl font-bold uppercase text-xs shadow-lg">
                                    {step === 1 ? 'Crear Ficha' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
            <ModalGalleryFicha
                isOpen={isGalleryOpen}
                onClose={() => {
                    setIsGalleryOpen(false);
                    setSelectingImageFor(null);
                }}
                images={watch('imagenes') || []}
                onSave={(imgs) => {
                    setValue('imagenes', imgs);
                    // If selecting for PDF image, take last uploaded image
                    if (selectingImageFor && imgs.length > 0) {
                        const lastDate = imgs[imgs.length - 1];
                        const lastImages = lastDate.data;
                        if (lastImages && lastImages.length > 0) {
                            const fieldName = selectingImageFor === 'image1' ? 's16_proc_image1' : 's16_proc_image2';
                            setValue(fieldName, lastImages[lastImages.length - 1]);
                            setSelectingImageFor(null);
                        }
                    }
                }}
                onSelectImage={(imgUrl) => {
                    if (selectingImageFor) {
                        const fieldName = selectingImageFor === 'image1' ? 's16_proc_image1' : 's16_proc_image2';
                        setValue(fieldName, imgUrl);
                        setIsGalleryOpen(false);
                        setSelectingImageFor(null);
                    }
                }}
                recordId={recordId}
                fichaType="ortodoncia"
            />
        </Transition>
    );
}
