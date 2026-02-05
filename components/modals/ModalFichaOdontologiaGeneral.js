'use client';

import { useState, Fragment, useEffect } from 'react';
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
    HeartIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    BeakerIcon,
    ShieldCheckIcon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    PhotoIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

import FichaOdontologiaDocument from '../pdf/FichaOdontologiaDocument';
import TratamientoIntegralDocument from '../pdf/TratamientoIntegralDocument';
import OdontogramaEditor from '../odontologia/OdontogramaEditor';
import { CIE10_DATA } from '../../lib/cie10';

// Zod Schema
const fichaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string().optional().or(z.literal('')).nullable(),
    cedula: z.string().min(1, 'La cédula es requerida'),
    edad: z.coerce.number().min(0, 'Edad inválida'),
    sexo: z.enum(['Femenino', 'Masculino', 'Otro']),
    fecha: z.string().default(() => new Date().toISOString().split('T')[0]),
    celular: z.string().optional(),
    telefono_fijo: z.string().optional(),
    direccion: z.string().optional(),

    motivo_consulta: z.string().optional(),
    enfermedad_actual: z.string().optional(),

    antecedentes_alergias: z.string().optional(),
    antecedentes_personales: z.string().optional(),
    medicamentos_actuales: z.string().optional(),
    problemas_anestesia: z.string().optional(),
    embarazada: z.boolean().default(false),
    embarazada_detalle: z.string().optional(),
    alergias: z.array(z.string()).default([]),
    alergias_otros: z.string().optional(),
    patologias: z.array(z.string()).default([]),
    patologias_otros: z.string().optional(),

    signos_vitales: z.object({
        presion_arterial: z.string().optional(),
        pulso: z.coerce.number().optional().nullable(),
        frecuencia_respiratoria: z.coerce.number().optional().nullable(),
        temperatura: z.coerce.number().optional().nullable(),
    }).optional(),

    examen_estomatognatico: z.object({
        opciones: z.array(z.string()).default([]),
        descripcion: z.string().optional(),
    }).optional(),

    odontograma: z.any().optional(),

    // Section 7
    higiene_oral: z.array(z.object({
        m1: z.string(),
        m2: z.string(),
        m3: z.string(),
        placa: z.string().optional(),
        calculo: z.string().optional(),
        gingivitis: z.string().optional(),
    })).default([
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
        { m1: '', m2: '', m3: '', placa: '', calculo: '', gingivitis: '' },
    ]),
    enfermedad_periodontal: z.string().optional(),
    maloclusion: z.string().optional(),
    fluorosis: z.string().optional(),

    // Section 8
    indices_cpo: z.object({
        c: z.coerce.number().default(0),
        p: z.coerce.number().default(0),
        o: z.coerce.number().default(0),
        total: z.coerce.number().default(0),
    }).default({ c: 0, p: 0, o: 0, total: 0 }),
    indices_ceo: z.object({
        c: z.coerce.number().default(0),
        e: z.coerce.number().default(0),
        o: z.coerce.number().default(0),
        total: z.coerce.number().default(0),
    }).default({ c: 0, e: 0, o: 0, total: 0 }),

    // Section 10
    planes: z.object({
        biometria: z.boolean().default(false),
        quimica_sanguinea: z.boolean().default(false),
        rayos_x: z.boolean().default(false),
        otros: z.boolean().default(false),
        observaciones: z.string().optional()
    }).optional(),

    // Section 11
    diagnostico: z.object({
        items: z.array(z.object({
            descripcion: z.string().optional(),
            cie: z.string().optional(),
            pre: z.boolean().default(false),
            def: z.boolean().default(false),
        })).default([
            { descripcion: '', cie: '', pre: false, def: false },
            { descripcion: '', cie: '', pre: false, def: false }
        ]),
        fecha_apertura: z.string().optional(),
        fecha_control: z.string().optional(),
        profesional: z.string().default('Dra. Diana Rodríguez'),
        numero_hoja: z.string().optional()
    }).optional(),

    // Section 12
    tratamiento: z.array(z.object({
        fecha: z.string().optional(),
        pieza: z.string().optional(),
        diagnostico: z.string().optional(),
        procedimiento: z.string().optional(),
        resumen: z.string().optional(),
        recomendaciones: z.string().optional(),
        indicaciones: z.string().optional(),
        observaciones: z.string().optional(),
        pago: z.string().optional(),
        forma_pago: z.string().optional(),
        firma: z.string().optional()
    })).default([]),

    // Consentimiento
    consentimiento: z.object({
        paciente_representante: z.string().optional(),
        ci: z.string().optional(),
        firma: z.string().optional(),
        correo: z.string().optional(),
        telefono: z.string().optional(),
        direccion: z.string().optional(),
    }).optional(),

    // Nuevo: Datos de Facturación
    usa_datos_facturacion: z.boolean().default(false),
    datos_facturacion: z.object({
        nombre_completo: z.string().optional(),
        ci_ruc: z.string().optional(),
        correo: z.string().optional(),
        telefono: z.string().optional(),
        direccion: z.string().optional(),
        firma: z.string().optional(),
    }).optional(),

    // Galería
    imagenes: z.array(z.object({
        date: z.string(),
        data: z.array(z.string())
    })).default([]),

    // Nuevo: Plan de Tratamiento (Tratamiento Integral)
    plan_tratamiento: z.array(z.object({
        fecha: z.string().optional(),
        mes_control: z.string().optional(),
        valor: z.coerce.number().default(0),
        firma: z.string().optional()
    })).default([]),
    plan_tratamiento_total: z.coerce.number().default(0)
});

export default function ModalFichaOdontologiaGeneral({ isOpen, onClose, onSuccess, editData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1); // 1: Patient, 2: Full Examination
    const [recordId, setRecordId] = useState(null);
    const [pdfData, setPdfData] = useState({});
    const [mainAccordion, setMainAccordion] = useState(null); // Closed by default
    const [subAccordion, setSubAccordion] = useState(null); // For sub-accordions within Ficha or Plan
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // CIE-10 Selector State
    const [isCieSelectorOpen, setIsCieSelectorOpen] = useState(false);
    const [activeCieIndex, setActiveCieIndex] = useState(null);
    const [cieSearchTerm, setCieSearchTerm] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        getValues,
        control,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(fichaSchema),
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            sexo: 'Femenino',
            embarazada: false,
            cedula: '',
            alergias: [],
            patologias: [],
            problemas_anestesia: '',
            examen_estomatognatico: {
                opciones: [],
                descripcion: ''
            },
            higiene_oral: [
                { m1: '16', m2: '17', m3: '55', placa: '', calculo: '', gingivitis: '' },
                { m1: '11', m2: '21', m3: '51', placa: '', calculo: '', gingivitis: '' },
                { m1: '26', m2: '27', m3: '65', placa: '', calculo: '', gingivitis: '' },
                { m1: '36', m2: '37', m3: '75', placa: '', calculo: '', gingivitis: '' },
                { m1: '31', m2: '41', m3: '71', placa: '', calculo: '', gingivitis: '' },
                { m1: '46', m2: '47', m3: '85', placa: '', calculo: '', gingivitis: '' },
            ],
            indices_cpo: { c: 0, p: 0, o: 0, total: 0 },
            indices_ceo: { c: 0, e: 0, o: 0, total: 0 },
            planes: {
                biometria: false,
                quimica_sanguinea: false,
                rayos_x: false,
                otros: false,
                observaciones: ''
            },
            diagnostico: {
                items: [
                    { descripcion: '', cie: '', pre: false, def: false },
                    { descripcion: '', cie: '', pre: false, def: false }
                ],
                fecha_apertura: new Date().toISOString().split('T')[0],
                fecha_control: '',
                profesional: 'Dra. Diana Rodríguez',
                numero_hoja: '1'
            },
            tratamiento: [
                { fecha: new Date().toISOString().split('T')[0], pieza: '', diagnostico: '', procedimiento: '', resumen: '', recomendaciones: '', indicaciones: '', observaciones: '', pago: '', forma_pago: '', firma: '' }
            ],
            consentimiento: {
                paciente_representante: '',
                ci: '',
                firma: '',
                correo: '',
                telefono: '',
                direccion: '',
            },
            usa_datos_facturacion: false,
            datos_facturacion: {
                nombre_completo: '',
                ci_ruc: '',
                correo: '',
                telefono: '',
                direccion: '',
                firma: ''
            },
            imagenes: [],
            plan_tratamiento: [
                { fecha: new Date().toISOString().split('T')[0], mes_control: '', valor: 0, firma: '' }
            ],
            plan_tratamiento_total: 0
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tratamiento"
    });

    const { fields: planFields, append: appendPlan, remove: removePlan } = useFieldArray({
        control,
        name: "plan_tratamiento"
    });

    // Calculate total automatically
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            // Only react to changes in plan_tratamiento
            if (name?.startsWith('plan_tratamiento.') || name === 'plan_tratamiento') {
                const planTratamientoData = value.plan_tratamiento || [];
                const total = planTratamientoData.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
                setValue('plan_tratamiento_total', total);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    // Reset step when modal is closed or load edit data
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setRecordId(null);
            setMainAccordion(null); // Ensure closed when modal closes/opens
            setSubAccordion(null);
            reset({
                fecha: new Date().toISOString().split('T')[0],
                sexo: 'Femenino',
                embarazada: false,
                cedula: '',
                alergias: [],
                patologias: [],
                examen_estomatognatico: {
                    opciones: [],
                    descripcion: ''
                }
            });
        } else if (editData) {
            setRecordId(editData.id);
            setStep(2);
            setMainAccordion(null); // Closed by default when editing a client
            reset(editData.data);
        }
    }, [isOpen, editData, reset]);

    const formData = watch();
    const selectedSexo = watch('sexo');

    // Manual PDF Refresh Logic
    const refreshPDF = () => {
        setPdfData(JSON.parse(JSON.stringify(getValues())));
    };

    // Initialize pdfData when loading edit data or patient data is registered
    useEffect(() => {
        if (isOpen && (editData || recordId)) {
            setPdfData(JSON.parse(JSON.stringify(getValues())));
        }
    }, [isOpen, editData, recordId]);

    // CIE-10 Selector Logic
    const filteredCieData = CIE10_DATA.map(group => ({
        ...group,
        items: group.items.filter(item =>
            item.code.toLowerCase().includes(cieSearchTerm.toLowerCase()) ||
            item.title.toLowerCase().includes(cieSearchTerm.toLowerCase())
        )
    })).filter(group => group.items.length > 0);

    const handleSelectCie = (item) => {
        if (activeCieIndex !== null) {
            // 1. Update Section 11
            setValue(`diagnostico.items.${activeCieIndex}.cie`, item.code);
            setValue(`diagnostico.items.${activeCieIndex}.descripcion`, item.title);

            // 2. Prepare combined diagnosis string from all Section 11 entries
            const allDiagItems = getValues('diagnostico.items') || [];
            // We use item.title for the current index because setValue is async and getValues might not have it yet
            const descriptions = allDiagItems.map((d, i) => i === activeCieIndex ? item.title : d.descripcion).filter(Boolean);
            const combinedDiag = descriptions.join(' / ');

            // 3. Auto-populate Section 12 (Plan de Tratamiento)
            const currentTratamiento = getValues('tratamiento') || [];
            if (currentTratamiento[activeCieIndex]) {
                setValue(`tratamiento.${activeCieIndex}.diagnostico`, combinedDiag);
            } else if (activeCieIndex === 0 && currentTratamiento.length === 0) {
                append({ fecha: new Date().toISOString().split('T')[0], pieza: '', diagnostico: combinedDiag, procedimiento: '', resumen: '', recomendaciones: '', indicaciones: '', observaciones: '', pago: '', forma_pago: '', firma: '' });
            }

            setIsCieSelectorOpen(false);
            setActiveCieIndex(null);
            setCieSearchTerm('');
        }
    };


    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            const isUpdate = step === 2 && recordId;
            const response = await fetch('/api/fichas', {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fichaType: 'odontologia',
                    id: recordId, // Only used for updates
                    data: data
                }),
            });

            if (response.ok) {
                const result = await response.json();

                if (step === 1) {
                    setRecordId(result.id);
                    setStep(2);
                    setMainAccordion(null); // Closed by default when transitioning from step 1
                    setSubAccordion(null);
                    // Do not alert here, just transition smoothly
                } else {
                    alert('Ficha completada y guardada exitosamente');
                    // reset();
                    // setStep(1);
                    // setRecordId(null);
                    onSuccess?.();
                    // onClose();
                }
            } else {
                throw new Error('Error al guardar en el servidor');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        { id: 1, title: 'Datos Personales', icon: UserIcon },
        { id: 2, title: 'Motivo de Consulta', icon: ChatBubbleLeftRightIcon },
        { id: 3, title: 'Enfermedad Actual o Problema Actual', icon: ClipboardDocumentCheckIcon },
        { id: 4, title: 'Antecedentes y Signos Vitales', icon: ShieldCheckIcon },
        { id: 5, title: 'Examen Estomatognático', icon: HeartIcon },
        { id: 6, title: 'Odontograma', icon: CalculatorIcon },
        { id: 7, title: 'Indicadores de Salud Bucal', icon: ClipboardDocumentCheckIcon },
        { id: 8, title: 'Índices CPO-ceo', icon: CalculatorIcon },
        { id: 10, title: 'Planes de Diagnóstico', icon: ClipboardDocumentCheckIcon },
        { id: 11, title: 'Diagnóstico', icon: ShieldCheckIcon },
        { id: 12, title: 'Plan de Tratamiento', icon: BeakerIcon },
        { id: 13, title: 'Consentimiento Informado', icon: ClipboardDocumentListIcon },
    ];


    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-[95vw] transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all h-[90vh] flex flex-col">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <BeakerIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                                                {step === 1 ? '1. Registro de Nuevo Paciente' : `2. Evaluación Clínica: ${formData.nombre || ''}${formData.apellido ? ' ' + formData.apellido : ''}`}
                                            </Dialog.Title>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="text-white hover:bg-white/20 rounded-full p-2 transition-all transform hover:rotate-90"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                        {/* Left Column - Form */}
                                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 border-r border-slate-200">
                                            <form id="ficha-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                                {step === 2 && (
                                                    <div className="space-y-4">
                                                        {/* Main Accordion 1: Ficha de Evaluación */}
                                                        <div className={`rounded-xl border-2 transition-all ${mainAccordion === 1 ? 'border-blue-500 bg-blue-50/5' : 'border-slate-200 bg-white'}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newState = mainAccordion === 1 ? null : 1;
                                                                    setMainAccordion(newState);
                                                                    if (newState === 1) {
                                                                        setTimeout(() => {
                                                                            const el = document.getElementById('accordion-1');
                                                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                id="accordion-1"
                                                                className="flex w-full items-center justify-between px-5 py-4 text-left"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <ClipboardDocumentListIcon className={`h-6 w-6 ${mainAccordion === 1 ? 'text-blue-600' : 'text-slate-400'}`} />
                                                                    <span className="text-sm font-black uppercase text-slate-700">1. FICHA DE EVALUACION CLINICA GENERAL</span>
                                                                </div>
                                                                <ChevronUpIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 1 ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {mainAccordion === 1 && (
                                                                <div className="p-4 space-y-4 border-t border-slate-100">
                                                                    {sections.map((section) => (
                                                                        <Disclosure key={section.id}>
                                                                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                                                <Disclosure.Button
                                                                                    onClick={() => {
                                                                                        const newState = subAccordion === section.id ? null : section.id;
                                                                                        setSubAccordion(newState);
                                                                                        if (newState) {
                                                                                            setTimeout(() => {
                                                                                                const el = document.getElementById(`sub-accordion-${section.id}`);
                                                                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                                                            }, 100);
                                                                                        }
                                                                                    }}
                                                                                    id={`sub-accordion-${section.id}`}
                                                                                    className="flex w-full justify-between items-center px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                                                                                >
                                                                                    <div className="flex items-center gap-3 text-blue-900">
                                                                                        <section.icon className="h-4 w-4" />
                                                                                        <span className="font-bold uppercase text-[11px] tracking-wide">{section.id}. {section.title}</span>
                                                                                    </div>
                                                                                    <ChevronUpIcon
                                                                                        className={`${subAccordion === section.id ? 'rotate-180 transform' : ''} h-4 w-4 text-blue-600 transition-transform`}
                                                                                    />
                                                                                </Disclosure.Button>
                                                                                {subAccordion === section.id && (
                                                                                    <Disclosure.Panel static className="px-4 pb-4 border-t border-slate-100 pt-3">

                                                                                        {section.id === 1 && (
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 uppercase">
                                                                                                <div className="space-y-2">
                                                                                                    <label>Nombre *</label>
                                                                                                    <input {...register('nombre')} className={`w-full p-2.5 bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                                                    {errors.nombre && <p className="text-red-500 lowercase mt-1">{errors.nombre.message}</p>}
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Apellido *</label>
                                                                                                    <input {...register('apellido')} className={`w-full p-2.5 bg-slate-50 border ${errors.apellido ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                                                    {errors.apellido && <p className="text-red-500 lowercase mt-1">{errors.apellido.message}</p>}
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Cédula / ID *</label>
                                                                                                    <input {...register('cedula')} className={`w-full p-2.5 bg-slate-50 border ${errors.cedula ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                                                    {errors.cedula && <p className="text-red-500 lowercase mt-1">{errors.cedula.message}</p>}
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Edad *</label>
                                                                                                    <input type="number" {...register('edad')} className={`w-full p-2.5 bg-slate-50 border ${errors.edad ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Sexo</label>
                                                                                                    <select {...register('sexo')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                                                                        <option value="Femenino">Femenino</option>
                                                                                                        <option value="Masculino">Masculino</option>
                                                                                                        <option value="Otro">Otro</option>
                                                                                                    </select>
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Fecha</label>
                                                                                                    <input type="date" {...register('fecha')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                                                                                </div>
                                                                                                <div className="space-y-2 md:col-span-2">
                                                                                                    <label>Dirección</label>
                                                                                                    <input {...register('direccion')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Celular *</label>
                                                                                                    <input type="tel" {...register('celular')} className={`w-full p-2.5 bg-slate-50 border ${errors.celular ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Teléfono Fijo</label>
                                                                                                    <input {...register('telefono_fijo')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 2 && (
                                                                                            <div className="space-y-2 text-xs font-semibold text-slate-700 uppercase">
                                                                                                <label>Motivo de Consulta *</label>
                                                                                                <textarea
                                                                                                    {...register('motivo_consulta')}
                                                                                                    rows={4}
                                                                                                    placeholder="Describa el motivo por el cual el paciente acude a consulta..."
                                                                                                    className={`w-full p-2.5 bg-slate-50 border ${errors.motivo_consulta ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                                                                                                />
                                                                                                {errors.motivo_consulta && <p className="text-red-500 lowercase mt-1">{errors.motivo_consulta.message}</p>}
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 3 && (
                                                                                            <div className="space-y-2 text-xs font-semibold text-slate-700 uppercase">
                                                                                                <label>Enfermedad o Problema Actual</label>
                                                                                                <textarea
                                                                                                    {...register('enfermedad_actual')}
                                                                                                    rows={6}
                                                                                                    placeholder="Describa la evolución de la enfermedad o problema actual..."
                                                                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                                />
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 4 && (
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700 uppercase">
                                                                                                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                                                                    <label className="block mb-3 text-blue-800 font-bold text-xs">Antecedentes Médicos y Clínicos</label>
                                                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                                        {[
                                                                                                            { val: 'ALERGIA ANTIBIOTICO', label: '1. Alergia Antibiótico' },
                                                                                                            { val: 'ALERGIA ANESTESIA', label: '2. Alergia Anestesia' },
                                                                                                            { val: 'HEMORRAGIAS', label: '3. Hemorragias' },
                                                                                                            { val: 'VIH/SIDA', label: '4. VIH/SIDA' },
                                                                                                            { val: 'TUBERCULOSIS', label: '5. Tuberculosis' },
                                                                                                            { val: 'ASMA', label: '6. Asma' },
                                                                                                            { val: 'DIABETES', label: '7. Diabetes' },
                                                                                                            { val: 'HIPERTENSION', label: '8. Hipertensión' },
                                                                                                            { val: 'ENF. CARDIACA', label: '9. Enf. Cardíaca' },
                                                                                                            { val: 'OTRO', label: '10. Otro' }
                                                                                                        ].map(item => (
                                                                                                            <label key={item.val} className="flex items-center gap-2 cursor-pointer border p-2 rounded-lg bg-white hover:border-blue-300 transition-colors lowercase font-normal">
                                                                                                                <input
                                                                                                                    type="checkbox"
                                                                                                                    value={item.val}
                                                                                                                    {...register('patologias')}
                                                                                                                    className="w-4 h-4 text-blue-600 rounded"
                                                                                                                />
                                                                                                                {item.label}
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    {watch('patologias')?.includes('OTRO') && (
                                                                                                        <div className="mt-3">
                                                                                                            <input
                                                                                                                {...register('patologias_otros')}
                                                                                                                placeholder="Especifique otros antecedentes..."
                                                                                                                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-normal text-xs"
                                                                                                            />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                {/* Embarazo field - ALWAYS visible */}
                                                                                                {true && (
                                                                                                    <div className="flex flex-col gap-3 p-3 bg-pink-50 border border-pink-100 rounded-xl md:col-span-2">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <input type="checkbox" {...register('embarazada')} className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400" />
                                                                                                            <label className="text-pink-900 cursor-pointer">¿Está embarazada actualmente?</label>
                                                                                                        </div>
                                                                                                        {watch('embarazada') && (
                                                                                                            <input
                                                                                                                {...register('embarazada_detalle')}
                                                                                                                placeholder="Describa detalles del embarazo..."
                                                                                                                className="w-full p-2 border border-pink-200 rounded-lg bg-white outline-none font-normal lowercase"
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}

                                                                                                <div className="space-y-2 md:col-span-2">
                                                                                                    <label>Medicamentos Actuales</label>
                                                                                                    <input {...register('medicamentos_actuales')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                </div>

                                                                                                <div className="space-y-2 md:col-span-2">
                                                                                                    <label>Problemas con Anestesia Local</label>
                                                                                                    <textarea {...register('problemas_anestesia')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                </div>

                                                                                                <div className="space-y-2">
                                                                                                    <label>Antecedentes de Alergias</label>
                                                                                                    <textarea {...register('antecedentes_alergias')} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label>Antecedentes Personales</label>
                                                                                                    <textarea {...register('antecedentes_personales')} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                </div>

                                                                                                <div className="md:col-span-2 mt-4">
                                                                                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-3 border-b pb-1">Signos Vitales</h4>
                                                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 uppercase text-xs font-semibold text-slate-700">
                                                                                                        <div className="space-y-2">
                                                                                                            <label>P. Arterial (mmHg)</label>
                                                                                                            <input {...register('signos_vitales.presion_arterial')} placeholder="ej: 120/80" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                            <label>Pulso (ppm)</label>
                                                                                                            <input type="number" {...register('signos_vitales.pulso')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                            <label>F. Resp (vpm)</label>
                                                                                                            <input type="number" {...register('signos_vitales.frecuencia_respiratoria')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                            <label>Temp (°C)</label>
                                                                                                            <input type="number" step="0.1" {...register('signos_vitales.temperatura')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 5 && (
                                                                                            <div className="space-y-6">
                                                                                                <div>
                                                                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-4 border-b pb-1">Marque las zonas de interés:</label>
                                                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                                        {['Labios', 'Mejillas', 'Maxilar superior', 'Maxilar inferior', 'Lengua', 'Paladar', 'Piso', 'Carrillos', 'Ganglios', 'Glandulas salivares', 'Orofaringe', 'A.T.M'].map((zona) => (
                                                                                                            <label key={zona} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                                                                                                <input
                                                                                                                    type="checkbox"
                                                                                                                    value={zona}
                                                                                                                    {...register('examen_estomatognatico.opciones')}
                                                                                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                                                                                                />
                                                                                                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700 transition-colors uppercase">{zona}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-xs font-bold text-slate-700 uppercase">Descripción del Hallazgo</label>
                                                                                                    <textarea
                                                                                                        {...register('examen_estomatognatico.descripcion')}
                                                                                                        rows={6}
                                                                                                        placeholder="Describa detalladamente los resultados del examen estomatognático..."
                                                                                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-normal shadow-sm"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 6 && (
                                                                                            <div className="-mx-5 -mb-5">
                                                                                                <Controller
                                                                                                    name="odontograma"
                                                                                                    control={control}
                                                                                                    render={({ field }) => (
                                                                                                        <OdontogramaEditor
                                                                                                            value={field.value}
                                                                                                            onChange={field.onChange}
                                                                                                        />
                                                                                                    )}
                                                                                                />
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 7 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                                                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-4">Higiene Oral Simplificada</h4>
                                                                                                    <div className="overflow-x-auto">
                                                                                                        <table className="w-full text-[10px] text-left border-collapse border border-slate-300">
                                                                                                            <thead>
                                                                                                                <tr className="bg-slate-200 text-slate-700 uppercase">
                                                                                                                    <th colSpan={3} className="p-1 border border-slate-300 text-center">Piezas Dentales</th>
                                                                                                                    <th className="p-1 border border-slate-300 text-center">Placa</th>
                                                                                                                    <th className="p-1 border border-slate-300 text-center">Cálculo</th>
                                                                                                                    <th className="p-1 border border-slate-300 text-center">Gingivitis</th>
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                {[
                                                                                                                    ['16', '17', '55'],
                                                                                                                    ['11', '21', '51'],
                                                                                                                    ['26', '27', '65'],
                                                                                                                    ['36', '37', '75'],
                                                                                                                    ['31', '41', '71'],
                                                                                                                    ['46', '47', '85'],
                                                                                                                ].map((rowPieces, rowIndex) => (
                                                                                                                    <tr key={rowIndex} className="bg-white hover:bg-slate-50">
                                                                                                                        {rowPieces.map((p, pIndex) => (
                                                                                                                            <td key={pIndex} className="p-0 border border-slate-200 bg-slate-50/50">
                                                                                                                                <div className="flex items-center justify-center py-1 gap-2">
                                                                                                                                    <span className="font-black text-slate-800 w-5 text-center">{p}</span>
                                                                                                                                    <input
                                                                                                                                        {...register(`higiene_oral.${rowIndex}.m${pIndex + 1}`)}
                                                                                                                                        className="w-7 h-7 border border-slate-300 rounded bg-white text-center focus:ring-2 focus:ring-blue-500 text-xs font-bold uppercase"
                                                                                                                                        maxLength={1}
                                                                                                                                    />
                                                                                                                                </div>
                                                                                                                            </td>
                                                                                                                        ))}
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input {...register(`higiene_oral.${rowIndex}.placa`)} className="w-full bg-transparent border-none outline-none text-center font-bold" placeholder="0-3" maxLength={1} />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input {...register(`higiene_oral.${rowIndex}.calculo`)} className="w-full bg-transparent border-none outline-none text-center font-bold" placeholder="0-3" maxLength={1} />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input {...register(`higiene_oral.${rowIndex}.gingivitis`)} className="w-full bg-transparent border-none outline-none text-center font-bold" placeholder="0-1" maxLength={1} />
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 uppercase text-xs font-bold text-slate-700">
                                                                                                    <div className="space-y-2">
                                                                                                        <label>Enfermedad Periodontal</label>
                                                                                                        <select {...register('enfermedad_periodontal')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none uppercase font-normal text-xs">
                                                                                                            <option value="">Ninguna</option>
                                                                                                            <option value="Leve">Leve</option>
                                                                                                            <option value="Moderada">Moderada</option>
                                                                                                            <option value="Severa">Severa</option>
                                                                                                        </select>
                                                                                                    </div>
                                                                                                    <div className="space-y-2">
                                                                                                        <label>Maloclusión</label>
                                                                                                        <select {...register('maloclusion')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none uppercase font-normal text-xs">
                                                                                                            <option value="">Ninguna</option>
                                                                                                            <option value="Angle I">Angle I</option>
                                                                                                            <option value="Angle II">Angle II</option>
                                                                                                            <option value="Angle III">Angle III</option>
                                                                                                        </select>
                                                                                                    </div>
                                                                                                    <div className="space-y-2">
                                                                                                        <label>Fluorosis</label>
                                                                                                        <select {...register('fluorosis')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none uppercase font-normal text-xs">
                                                                                                            <option value="">Ninguna</option>
                                                                                                            <option value="Leve">Leve</option>
                                                                                                            <option value="Moderada">Moderada</option>
                                                                                                            <option value="Severa">Severa</option>
                                                                                                        </select>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 8 && (
                                                                                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                                                    <div className="space-y-4">
                                                                                                        <h4 className="text-xs font-bold text-blue-900 border-b pb-2 uppercase italic">Dientes Permanentes (CPO)</h4>
                                                                                                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase text-slate-500">
                                                                                                            <div>C</div><div>P</div><div>O</div><div className="text-blue-600">Total</div>
                                                                                                        </div>
                                                                                                        <div className="grid grid-cols-4 gap-2">
                                                                                                            <input type="number" {...register('indices_cpo.c')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_cpo.p')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_cpo.o')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_cpo.total')} className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg text-center font-bold text-blue-700" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="space-y-4">
                                                                                                        <h4 className="text-xs font-bold text-emerald-900 border-b pb-2 uppercase italic">Dientes Deciduos (ceo)</h4>
                                                                                                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase text-slate-500">
                                                                                                            <div>c</div><div>e</div><div>o</div><div className="text-emerald-600">Total</div>
                                                                                                        </div>
                                                                                                        <div className="grid grid-cols-4 gap-2">
                                                                                                            <input type="number" {...register('indices_ceo.c')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_ceo.e')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_ceo.o')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold" />
                                                                                                            <input type="number" {...register('indices_ceo.total')} className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center font-bold text-emerald-700" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 10 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                                                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-4 border-b pb-2">Planes de Diagnóstico, Terapéutico y Educacional</h4>
                                                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                                                                        {[
                                                                                                            { key: 'biometria', label: 'Biometría' },
                                                                                                            { key: 'quimica_sanguinea', label: 'Química Sanguínea' },
                                                                                                            { key: 'rayos_x', label: 'Rayos - X' },
                                                                                                            { key: 'otros', label: 'Otros' }
                                                                                                        ].map((item) => (
                                                                                                            <label key={item.key} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                                                                                                                <input
                                                                                                                    type="checkbox"
                                                                                                                    {...register(`planes.${item.key}`)}
                                                                                                                    className="w-4 h-4 text-blue-600 rounded"
                                                                                                                />
                                                                                                                <span className="text-xs font-semibold text-slate-700 uppercase">{item.label}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="space-y-2">
                                                                                                        <label className="text-xs font-bold text-slate-700 uppercase">Observaciones</label>
                                                                                                        <textarea
                                                                                                            {...register('planes.observaciones')}
                                                                                                            rows={6}
                                                                                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                                                                            placeholder="Escriba las observaciones aquí..."
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 11 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                                                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-4 border-b pb-2">11. Diagnóstico</h4>
                                                                                                    <div className="overflow-x-auto">
                                                                                                        <table className="w-full text-xs text-left">
                                                                                                            <thead className="bg-slate-100 uppercase text-slate-600 font-bold text-[10px]">
                                                                                                                <tr>
                                                                                                                    <th className="p-2 border border-slate-200 w-10">#</th>
                                                                                                                    <th className="p-2 border border-slate-200">Descripción (PRE-PRESUNTIVO / DEF-DEFINITIVO)</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-24 text-center">CIE</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-16 text-center">PRE</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-16 text-center">DEF</th>
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                {[0, 1].map((idx) => (
                                                                                                                    <tr key={idx}>
                                                                                                                        <td className="p-2 border border-slate-200 text-center font-bold">{idx + 1}</td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="text"
                                                                                                                                {...register(`diagnostico.items.${idx}.descripcion`)}
                                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="text"
                                                                                                                                {...register(`diagnostico.items.${idx}.cie`)}
                                                                                                                                onClick={() => {
                                                                                                                                    setActiveCieIndex(idx);
                                                                                                                                    setIsCieSelectorOpen(true);
                                                                                                                                }}
                                                                                                                                readOnly
                                                                                                                                placeholder="CLIC..."
                                                                                                                                className="w-full p-2 bg-blue-50 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-center font-bold cursor-pointer hover:bg-blue-100 transition-colors uppercase"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200 text-center">
                                                                                                                            <input
                                                                                                                                type="checkbox"
                                                                                                                                {...register(`diagnostico.items.${idx}.pre`)}
                                                                                                                                className="w-4 h-4 text-blue-600 rounded"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200 text-center">
                                                                                                                            <input
                                                                                                                                type="checkbox"
                                                                                                                                {...register(`diagnostico.items.${idx}.def`)}
                                                                                                                                className="w-4 h-4 text-blue-600 rounded"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>

                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Apertura</label>
                                                                                                            <input
                                                                                                                type="date"
                                                                                                                {...register('diagnostico.fecha_apertura')}
                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Control</label>
                                                                                                            <input
                                                                                                                type="date"
                                                                                                                {...register('diagnostico.fecha_control')}
                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-amber-700 uppercase">Nombre Completo</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('datos_facturacion.nombre_completo')}
                                                                                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                placeholder="Nombre para la factura"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Profesional</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('diagnostico.profesional')}
                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Número de Hoja</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('diagnostico.numero_hoja')}
                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 12 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                                                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                                                                                        <h4 className="text-xs font-bold text-blue-900 uppercase">12. Plan de Tratamiento</h4>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => append({ fecha: new Date().toISOString().split('T')[0], pieza: '', diagnostico: '', procedimiento: '', resumen: '', recomendaciones: '', indicaciones: '', observaciones: '', pago: '', forma_pago: '', firma: '' })}
                                                                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                                                                        >
                                                                                                            <PlusIcon className="h-3 w-3" />
                                                                                                            AÑADIR SESIÓN
                                                                                                        </button>
                                                                                                    </div>

                                                                                                    <div className="overflow-x-auto">
                                                                                                        <table className="w-full text-left border-collapse" style={{ minWidth: '1300px' }}>
                                                                                                            <thead className="bg-slate-100 uppercase text-slate-600 font-bold text-[9px]">
                                                                                                                <tr>
                                                                                                                    <th className="p-2 border border-slate-200 w-28">Fecha</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-16">Pieza</th>
                                                                                                                    <th className="p-2 border border-slate-200">Diagnóstico/Complicaciones</th>
                                                                                                                    <th className="p-2 border border-slate-200">Procedimientos/Prescripción</th>
                                                                                                                    <th className="p-2 border border-slate-200">Resumen</th>
                                                                                                                    <th className="p-2 border border-slate-200">Recomendaciones</th>
                                                                                                                    <th className="p-2 border border-slate-200">Indicaciones</th>
                                                                                                                    <th className="p-2 border border-slate-200">Observaciones</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-24 text-right">Pago</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-32">Forma de Pago</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-24">Firma</th>
                                                                                                                    <th className="p-2 border border-slate-200 w-16 text-center">Op</th>
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                {fields.map((field, index) => (
                                                                                                                    <tr key={field.id}>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="date"
                                                                                                                                {...register(`tratamiento.${index}.fecha`)}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="text"
                                                                                                                                {...register(`tratamiento.${index}.pieza`)}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] text-center font-bold outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                                                                                                                                placeholder="Pz"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.diagnostico`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.procedimiento`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.resumen`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.recomendaciones`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.indicaciones`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <textarea
                                                                                                                                {...register(`tratamiento.${index}.observaciones`)}
                                                                                                                                rows={2}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="text"
                                                                                                                                {...register(`tratamiento.${index}.pago`)}
                                                                                                                                className="w-full p-2 bg-slate-50 border border-slate-100 rounded text-[10px] font-black text-blue-700 text-right outline-none focus:ring-1 focus:ring-blue-500"
                                                                                                                                placeholder="$ 0.00"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <select
                                                                                                                                {...register(`tratamiento.${index}.forma_pago`)}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[9px] font-bold outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                                                                                                                            >
                                                                                                                                <option value="">SELECCIONAR...</option>
                                                                                                                                <option value="EFECTIVO">EFECTIVO</option>
                                                                                                                                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                                                                                                                <option value="TARJETA DE CRÉDITO">TARJETA CRÉDITO</option>
                                                                                                                                <option value="TARJETA DE DÉBITO">TARJETA DÉBITO</option>
                                                                                                                            </select>
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200">
                                                                                                                            <input
                                                                                                                                type="text"
                                                                                                                                {...register(`tratamiento.${index}.firma`)}
                                                                                                                                className="w-full p-2 bg-white border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500"
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="p-1 border border-slate-200 text-center">
                                                                                                                            <button
                                                                                                                                type="button"
                                                                                                                                onClick={() => remove(index)}
                                                                                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                                                            >
                                                                                                                                <XMarkIcon className="h-4 w-4" />
                                                                                                                            </button>
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 13 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                                                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-4 border-b pb-2">Consentimiento Informado</h4>
                                                                                                    <p className="text-[11px] text-slate-600 mb-6 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100 italic">
                                                                                                        <strong>CONSENTIMIENTO INFORMADO:</strong> Entiendo y he sido informando/a sobre los propósitos del tratamiento, riesgos y posibles complicaciones, por lo que autorizo al profesional actuante a realizar los procedimientos odontológicos necesarios.
                                                                                                    </p>

                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Paciente/Representante</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('consentimiento.paciente_representante')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="Nombre completo"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">C.I.</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('consentimiento.ci')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="Cédula de Identidad"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Firma</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('consentimiento.firma')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="Firma del paciente"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Correo</label>
                                                                                                            <input
                                                                                                                type="email"
                                                                                                                {...register('consentimiento.correo')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="ejemplo@correo.com"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('consentimiento.telefono')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="09XXXXXXXX"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Dirección</label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                {...register('consentimiento.direccion')}
                                                                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                                                                                                                placeholder="Dirección domiciliaria"
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Toggle for Billing Data */}
                                                                                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                                                                                        <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100/50 transition-all group">
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                {...register('usa_datos_facturacion')}
                                                                                                                className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 transition-transform group-active:scale-90"
                                                                                                            />
                                                                                                            <div className="flex flex-col">
                                                                                                                <span className="text-xs font-black text-blue-900 uppercase tracking-wide">¿Requiere datos de facturación diferentes?</span>
                                                                                                                <span className="text-[10px] text-blue-600 font-medium">Active esta opción para agregar información específica para la factura en el PDF.</span>
                                                                                                            </div>
                                                                                                        </label>
                                                                                                    </div>

                                                                                                    {/* Billing Data Block */}
                                                                                                    {watch('usa_datos_facturacion') && (
                                                                                                        <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                                                                                            <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-200 shadow-sm">
                                                                                                                <h4 className="text-[11px] font-black text-amber-900 uppercase mb-5 flex items-center gap-2">
                                                                                                                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                                                                                                    Datos para Facturación
                                                                                                                </h4>

                                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                                    <div className="space-y-1">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">Nombre Completo</label>
                                                                                                                        <input
                                                                                                                            type="text"
                                                                                                                            {...register('datos_facturacion.nombre_completo')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="Nombre para la factura"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="space-y-1">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">C.I. / RUC</label>
                                                                                                                        <input
                                                                                                                            type="text"
                                                                                                                            {...register('datos_facturacion.ci_ruc')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="Identificación fiscal"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="space-y-1">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">Correo</label>
                                                                                                                        <input
                                                                                                                            type="email"
                                                                                                                            {...register('datos_facturacion.correo')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="ejemplo@correo.com"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="space-y-1">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">Teléfono</label>
                                                                                                                        <input
                                                                                                                            type="tel"
                                                                                                                            {...register('datos_facturacion.telefono')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="09XXXXXXXX"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="space-y-1 md:col-span-2">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">Dirección</label>
                                                                                                                        <input
                                                                                                                            type="text"
                                                                                                                            {...register('datos_facturacion.direccion')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="Dirección para facturación"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="space-y-1 md:col-span-2">
                                                                                                                        <label className="text-[10px] font-bold text-amber-700 uppercase">Firma del representante (Opcional)</label>
                                                                                                                        <input
                                                                                                                            type="text"
                                                                                                                            {...register('datos_facturacion.firma')}
                                                                                                                            className="w-full p-2.5 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                                                                                                                            placeholder="Nombre de quien firma"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}


                                                                                    </Disclosure.Panel>
                                                                                )}
                                                                            </div>
                                                                        </Disclosure>
                                                                    ))}

                                                                </div>
                                                            )}
                                                        </div>



                                                        {/* Archivos Multimedia - Always visible in Step 2 */}
                                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm">
                                                                <div className="p-4 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                                                    <PhotoIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-800 uppercase">Archivos Multimedia / Imágenes</h4>
                                                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Sube y gestiona radiografías, fotos clínicas y otros archivos visuales del paciente.</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!recordId) {
                                                                            alert('Por favor, registra los datos del paciente (PASO 1) antes de subir imágenes para asegurar que se guarden correctamente.');
                                                                            return;
                                                                        }
                                                                        setIsGalleryOpen(true);
                                                                    }}
                                                                    className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg uppercase text-[10px] tracking-widest ${!recordId ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                                                                >
                                                                    {!recordId ? 'REGISTRA AL PACIENTE PARA SUBIR FOTOS' : 'ABRIR GALERÍA CLÍNICA'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {step === 1 && (
                                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                                            <UserIcon className="h-5 w-5 text-blue-600" />
                                                            <span className="font-bold uppercase text-sm tracking-wide text-blue-900">DATOS DEL PACIENTE</span>
                                                        </div>
                                                        <div className="p-5">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 uppercase">
                                                                <div className="space-y-2">
                                                                    <label>Nombre *</label>
                                                                    <input {...register('nombre')} className={`w-full p-2.5 bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                    {errors.nombre && <p className="text-red-500 lowercase mt-1">{errors.nombre.message}</p>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label>Apellido *</label>
                                                                    <input {...register('apellido')} className={`w-full p-2.5 bg-slate-50 border ${errors.apellido ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                    {errors.apellido && <p className="text-red-500 lowercase mt-1">{errors.apellido.message}</p>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label>Cédula / ID *</label>
                                                                    <input {...register('cedula')} className={`w-full p-2.5 bg-slate-50 border ${errors.cedula ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                    {errors.cedula && <p className="text-red-500 lowercase mt-1">{errors.cedula.message}</p>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label>Edad *</label>
                                                                    <input type="number" {...register('edad')} className={`w-full p-2.5 bg-slate-50 border ${errors.edad ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label>Sexo</label>
                                                                    <select {...register('sexo')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                                        <option value="Femenino">Femenino</option>
                                                                        <option value="Masculino">Masculino</option>
                                                                        <option value="Otro">Otro</option>
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label>Fecha</label>
                                                                    <input type="date" {...register('fecha')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </form>
                                            <ModalGalleryFicha
                                                isOpen={isGalleryOpen}
                                                onClose={() => setIsGalleryOpen(false)}
                                                images={watch('imagenes') || []}
                                                onSave={(newImages) => setValue('imagenes', newImages, { shouldDirty: true })}
                                                recordId={recordId}
                                                fichaType="odontologia"
                                            />
                                        </div>

                                        {/* Right Column - PDF Preview */}
                                        <div className={`${step === 1 ? 'hidden' : 'hidden lg:flex'} w-[40%] bg-slate-200 flex-col relative`}>
                                            <div className="absolute inset-0 p-4">
                                                <div className="w-full h-full bg-slate-800 rounded-xl shadow-inner flex flex-col overflow-hidden relative">
                                                    <div className="p-3 bg-slate-700 flex items-center justify-between shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white text-xs font-mono uppercase">Vista Previa</span>
                                                            <div className={`h-2 w-2 rounded-full ${JSON.stringify(formData) === JSON.stringify(pdfData) ? 'bg-green-500' : 'bg-amber-500 animate-pulse outline outline-2 outline-amber-500/30'}`} />
                                                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                                                                {JSON.stringify(formData) === JSON.stringify(pdfData) ? 'Sincronizado' : 'Cambios pendientes...'}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={refreshPDF}
                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded-lg font-bold transition-all transform active:scale-95 flex items-center gap-1 shadow-lg"
                                                            >
                                                                <ArrowPathIcon className="h-3 w-3" />
                                                                ACTUALIZAR
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-h-0 bg-white">
                                                        <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                                                            <FichaOdontologiaDocument key={`ficha-${JSON.stringify(pdfData)}`} data={pdfData} />
                                                        </PDFViewer>
                                                    </div>

                                                    {/* Floating Warning for pending changes - REMOVED AS REQUESTED */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap gap-4 justify-end shrink-0 shadow-upper z-10">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 uppercase text-xs"
                                        >
                                            Cancelar
                                        </button>

                                        {step === 2 && (
                                            <PDFDownloadLink
                                                document={<FichaOdontologiaDocument key={`dl-ficha-${JSON.stringify(pdfData)}`} data={pdfData} />}
                                                fileName={`ficha-odontologia-${formData.nombre || 'paciente'}.pdf`}
                                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 uppercase text-xs"
                                            >
                                                {({ loading }) => (loading ? 'Procesando...' : 'Descargar PDF')}
                                            </PDFDownloadLink>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSubmit(onSubmit, (errors) => {
                                                console.error("Validation errors:", errors);
                                                const mandatoryFilter = Object.keys(errors).filter(k => ['nombre', 'cedula', 'edad'].includes(k));
                                                if (mandatoryFilter.length > 0) {
                                                    const missing = mandatoryFilter.map(k => {
                                                        if (k === 'nombre') return 'Nombre';
                                                        if (k === 'cedula') return 'Cédula';
                                                        if (k === 'edad') return 'Edad';
                                                        return k;
                                                    }).join(', ');
                                                    alert(`No se puede guardar. Faltan datos de identidad obligatorios: ${missing}`);
                                                } else {
                                                    alert("Hay errores de validación en el formulario. Por favor revise los campos.");
                                                }
                                            })}
                                            disabled={isSaving}
                                            className={`px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold transition-all active:scale-95 uppercase text-xs shadow-lg shadow-blue-200 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                step === 1 ? 'Siguiente: Examen Clínico' : 'Finalizar Ficha'
                                            )}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* CIE-10 Selector Modal */}
            <Transition show={isCieSelectorOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[100]"
                    onClose={() => setIsCieSelectorOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 rounded-t-2xl">
                                        <Dialog.Title className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                            <ClipboardDocumentListIcon className="h-4 w-4" />
                                            Seleccionar Código CIE-10
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsCieSelectorOpen(false)}
                                            className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                                        <div className="relative">
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por código o descripción... (ej: K021)"
                                                value={cieSearchTerm}
                                                onChange={(e) => setCieSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                                        {filteredCieData.length > 0 ? (
                                            filteredCieData.map((group, groupIdx) => (
                                                <div key={groupIdx} className="space-y-1">
                                                    <h5 className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 rounded-lg">{group.group}</h5>
                                                    <div className="space-y-0.5">
                                                        {group.items.map((item, itemIdx) => (
                                                            <button
                                                                key={itemIdx}
                                                                onClick={() => handleSelectCie(item)}
                                                                className="w-full flex items-start gap-3 p-3 hover:bg-blue-50 rounded-xl transition-all text-left border border-transparent hover:border-blue-100 group"
                                                            >
                                                                <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors uppercase">
                                                                    {item.code}
                                                                </span>
                                                                <span className="text-xs font-semibold text-slate-700 leading-relaxed uppercase">
                                                                    {item.title}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <MagnifyingGlassIcon className="h-6 w-6 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 text-xs font-bold uppercase">No se encontraron códigos</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
                                        <button
                                            onClick={() => setIsCieSelectorOpen(false)}
                                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 uppercase"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
