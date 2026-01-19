'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NavigatorChoice {
  choice_id: string;
  text: string;
  next_step_id: string | null;
  result_profile_id?: string;
}

interface NavigatorStep {
  step_id: string;
  question_text: string;
  choices: NavigatorChoice[];
  crisis_trigger?: boolean;
}

interface NavigatorResultProfile {
  id: string;
  title: string;
  description: string;
  recommendations?: {
    articles?: string[];
    exercises?: string[];
    resources?: string[];
  };
  cta?: {
    text: string;
    link: string;
  };
}

interface NavigatorConfig {
  initial_step_id: string;
  steps: NavigatorStep[];
  result_profiles: NavigatorResultProfile[];
}

interface NavigatorDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  config: NavigatorConfig | null;
  publishedAt: string | null;
}

interface DefinitionVersion {
  id: string;
  version: number;
  createdAt: string;
  createdByUserId: string | null;
  config: NavigatorConfig;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const StepNode = ({ data }: { data: { step: NavigatorStep } }) => (
  <div className="rounded border border-border bg-card px-3 py-2 shadow-sm text-xs min-w-[180px]">
    <div className="font-semibold text-foreground mb-2">{data.step.question_text || 'Без текста'}</div>
    <div className="space-y-1">
      {data.step.choices.map((choice) => (
        <div key={choice.choice_id} className="relative flex items-center gap-2">
          <Handle
            type="source"
            id={choice.choice_id}
            position={Position.Right}
            className="!bg-primary"
          />
          <span className="text-xs text-muted-foreground">{choice.text || 'Без текста'}</span>
        </div>
      ))}
    </div>
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
  </div>
);

const ResultNode = ({ data }: { data: { profile: NavigatorResultProfile } }) => (
  <div className="rounded border border-success/30 bg-success/10 px-3 py-2 shadow-sm text-xs min-w-[180px]">
    <div className="font-semibold text-foreground">{data.profile.title || 'Профиль результата'}</div>
    <div className="text-xs text-success">{data.profile.id}</div>
    <Handle type="target" position={Position.Left} className="!bg-success" />
  </div>
);

const nodeTypes = {
  step: StepNode,
  result: ResultNode,
};

const buildDiffSummary = (draft: NavigatorConfig, published: NavigatorConfig) => {
  const notes: string[] = [];

  if (draft.initial_step_id !== published.initial_step_id) {
    notes.push(`Стартовый шаг: ${published.initial_step_id} → ${draft.initial_step_id}`);
  }

  const publishedSteps = new Map(published.steps.map((step) => [step.step_id, step]));
  const draftSteps = new Map(draft.steps.map((step) => [step.step_id, step]));

  const addedSteps = draft.steps.filter((step) => !publishedSteps.has(step.step_id));
  const removedSteps = published.steps.filter((step) => !draftSteps.has(step.step_id));

  if (addedSteps.length) {
    notes.push(`Добавлены шаги: ${addedSteps.map((step) => step.step_id).join(', ')}`);
  }
  if (removedSteps.length) {
    notes.push(`Удалены шаги: ${removedSteps.map((step) => step.step_id).join(', ')}`);
  }

  draft.steps.forEach((draftStep) => {
    const publishedStep = publishedSteps.get(draftStep.step_id);
    if (!publishedStep) return;
    if (draftStep.question_text !== publishedStep.question_text) {
      notes.push(`Шаг ${draftStep.step_id}: обновлён текст вопроса`);
    }

    const publishedChoices = new Map(publishedStep.choices.map((choice) => [choice.choice_id, choice]));
    const draftChoices = new Map(draftStep.choices.map((choice) => [choice.choice_id, choice]));

    const addedChoices = draftStep.choices.filter((choice) => !publishedChoices.has(choice.choice_id));
    const removedChoices = publishedStep.choices.filter((choice) => !draftChoices.has(choice.choice_id));

    if (addedChoices.length) {
      notes.push(`Шаг ${draftStep.step_id}: добавлены варианты ${addedChoices.map((c) => c.choice_id).join(', ')}`);
    }
    if (removedChoices.length) {
      notes.push(`Шаг ${draftStep.step_id}: удалены варианты ${removedChoices.map((c) => c.choice_id).join(', ')}`);
    }

    draftStep.choices.forEach((draftChoice) => {
      const publishedChoice = publishedChoices.get(draftChoice.choice_id);
      if (!publishedChoice) return;
      if (draftChoice.text !== publishedChoice.text) {
        notes.push(`Шаг ${draftStep.step_id}: изменён текст варианта ${draftChoice.choice_id}`);
      }
      if (
        draftChoice.next_step_id !== publishedChoice.next_step_id ||
        draftChoice.result_profile_id !== publishedChoice.result_profile_id
      ) {
        notes.push(`Шаг ${draftStep.step_id}: изменена связь варианта ${draftChoice.choice_id}`);
      }
    });
  });

  const publishedProfiles = new Map(published.result_profiles.map((profile) => [profile.id, profile]));
  const draftProfiles = new Map(draft.result_profiles.map((profile) => [profile.id, profile]));

  const addedProfiles = draft.result_profiles.filter((profile) => !publishedProfiles.has(profile.id));
  const removedProfiles = published.result_profiles.filter((profile) => !draftProfiles.has(profile.id));

  if (addedProfiles.length) {
    notes.push(`Добавлены профили результата: ${addedProfiles.map((p) => p.id).join(', ')}`);
  }
  if (removedProfiles.length) {
    notes.push(`Удалены профили результата: ${removedProfiles.map((p) => p.id).join(', ')}`);
  }

  draft.result_profiles.forEach((profile) => {
    const publishedProfile = publishedProfiles.get(profile.id);
    if (!publishedProfile) return;
    if (profile.title !== publishedProfile.title || profile.description !== publishedProfile.description) {
      notes.push(`Профиль ${profile.id}: обновлены заголовок/описание`);
    }
  });

  return notes;
};

export default function NavigatorEditorPage() {
  const [definition, setDefinition] = useState<NavigatorDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [versions, setVersions] = useState<DefinitionVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versionConfig, setVersionConfig] = useState<NavigatorConfig | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [diffSummary, setDiffSummary] = useState<string[]>([]);

  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  useEffect(() => {
    if (!id) return;
    fetchDefinition();
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!definition?.config) return;
    const { steps, result_profiles } = definition.config;
    const stepNodes: Node[] = steps.map((step, idx) => ({
      id: step.step_id,
      type: 'step',
      position: nodePositions[step.step_id] ?? { x: 0, y: idx * 160 },
      data: { step },
    }));
    const resultNodes: Node[] = result_profiles.map((profile, idx) => ({
      id: profile.id,
      type: 'result',
      position: nodePositions[profile.id] ?? { x: 420, y: idx * 140 },
      data: { profile },
    }));
    const newEdges: Edge[] = [];
    steps.forEach((step) => {
      step.choices.forEach((choice) => {
        const target = choice.next_step_id || choice.result_profile_id;
        if (!target) return;
        newEdges.push({
          id: `edge-${choice.choice_id}`,
          source: step.step_id,
          sourceHandle: choice.choice_id,
          target,
          type: 'smoothstep',
          label: choice.text || 'Без текста',
          data: { choiceId: choice.choice_id, stepId: step.step_id },
        });
      });
    });
    setNodes([...stepNodes, ...resultNodes]);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition?.config, nodePositions]);

  useEffect(() => {
    if (!definition?.config || !versionConfig) {
      setDiffSummary([]);
      return;
    }
    setDiffSummary(buildDiffSummary(definition.config, versionConfig));
  }, [definition?.config, versionConfig]);

  const fetchDefinition = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить навигатор');
      }
      const data = await response.json();
      setDefinition(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    setVersionError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}/versions`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить версии');
      }
      const data = await response.json();
      setVersions(data);
      if (data.length > 0 && !selectedVersion) {
        setSelectedVersion(data[0].version);
        fetchVersionConfig(data[0].version);
      }
    } catch (err: any) {
      setVersionError(err.message);
    }
  };

  const fetchVersionConfig = async (version: number) => {
    setVersionError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}/versions/${version}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить версию');
      }
      const data = await response.json();
      setVersionConfig(data.config);
    } catch (err: any) {
      setVersionError(err.message);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      return;
    }
    if (!definition) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/navigators/${definition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: definition.title,
          topicCode: definition.topicCode,
          config: definition.config,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось сохранить');
      }
      await fetchValidation();
      await fetchVersions();
      alert('Сохранено успешно');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!canEdit) {
      return;
    }
    if (!definition) return;
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/navigators/${definition.id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось опубликовать');
      }
      await fetchDefinition();
      await fetchVersions();
      await fetchValidation();
      alert('Опубликовано успешно');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const fetchValidation = async () => {
    try {
      const response = await fetch(`/api/admin/interactive/navigators/${id}/validate`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось проверить валидность');
      }
      const data = await response.json();
      setValidation(data);
    } catch (err: any) {
      setValidation({ isValid: false, errors: [err.message] });
    }
  };

  const updateStep = (stepId: string, updater: (step: NavigatorStep) => NavigatorStep) => {
    if (!definition?.config) return;
    const steps = definition.config.steps.map((step) =>
      step.step_id === stepId ? updater(step) : step,
    );
    setDefinition({ ...definition, config: { ...definition.config, steps } });
  };

  const updateResultProfile = (profileId: string, updater: (profile: NavigatorResultProfile) => NavigatorResultProfile) => {
    if (!definition?.config) return;
    const result_profiles = definition.config.result_profiles.map((profile) =>
      profile.id === profileId ? updater(profile) : profile,
    );
    setDefinition({ ...definition, config: { ...definition.config, result_profiles } });
  };

  const handleConnect = (connection: Connection) => {
    if (!definition?.config || !connection.source || !connection.sourceHandle || !connection.target) return;
    updateStep(connection.source, (step) => ({
      ...step,
      choices: step.choices.map((choice) =>
        choice.choice_id === connection.sourceHandle
          ? {
              ...choice,
              next_step_id: definition.config?.steps.some((s) => s.step_id === connection.target)
                ? connection.target
                : null,
              result_profile_id: definition.config?.result_profiles.some((r) => r.id === connection.target)
                ? connection.target
                : undefined,
            }
          : choice,
      ),
    }));
    setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds));
  };

  const handleNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    setNodePositions((prev) => {
      const next = { ...prev };
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          next[change.id] = change.position;
        }
      });
      return next;
    });
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    changes
      .filter((change) => change.type === 'remove')
      .forEach((change) => {
        const edge = edges.find((item) => item.id === change.id);
        const choiceId = edge?.data?.choiceId as string | undefined;
        const stepId = edge?.data?.stepId as string | undefined;
        if (!choiceId || !stepId) return;
        updateStep(stepId, (step) => ({
          ...step,
          choices: step.choices.map((choice) =>
            choice.choice_id === choiceId
              ? { ...choice, next_step_id: null, result_profile_id: undefined }
              : choice,
          ),
        }));
      });
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const addStep = () => {
    if (!definition?.config) return;
    const newStepId = `step_${createId()}`;
    const newChoiceId = `choice_${createId()}`;
    const newStep: NavigatorStep = {
      step_id: newStepId,
      question_text: 'Новый шаг',
      choices: [{ choice_id: newChoiceId, text: 'Новый вариант', next_step_id: null }],
    };
    setDefinition({
      ...definition,
      config: {
        ...definition.config,
        steps: [...definition.config.steps, newStep],
      },
    });
    setSelectedNodeId(newStepId);
  };

  const addChoice = (stepId: string) => {
    updateStep(stepId, (step) => ({
      ...step,
      choices: [...step.choices, { choice_id: `choice_${createId()}`, text: '', next_step_id: null }],
    }));
  };

  const removeChoice = (stepId: string, choiceId: string) => {
    updateStep(stepId, (step) => {
      if (step.choices.length <= 1) return step;
      return {
        ...step,
        choices: step.choices.filter((choice) => choice.choice_id !== choiceId),
      };
    });
  };

  const selectedStep = useMemo(() => {
    if (!definition?.config || !selectedNodeId) return null;
    return definition.config.steps.find((step) => step.step_id === selectedNodeId) ?? null;
  }, [definition?.config, selectedNodeId]);

  const selectedProfile = useMemo(() => {
    if (!definition?.config || !selectedNodeId) return null;
    return definition.config.result_profiles.find((profile) => profile.id === selectedNodeId) ?? null;
  }, [definition?.config, selectedNodeId]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !definition ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !definition || !definition.config ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Навигатор не найден</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button asChild variant="link" className="px-0">
                <Link href="/interactive/navigator">← Назад к списку</Link>
              </Button>
              <h1 className="text-2xl font-semibold text-foreground mt-2">{definition.title}</h1>
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={!canEdit || saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              {canEdit && (
                <Button onClick={handlePublish} disabled={publishing} variant="outline">
                  {publishing ? 'Публикация...' : 'Опубликовать изменения'}
                </Button>
              )}
              <Button onClick={fetchValidation} variant="secondary">
                Проверить валидность
              </Button>
              <Button onClick={addStep} variant="outline">
                Добавить шаг
              </Button>
            </div>
          </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-4">
            <ReactFlowProvider>
              <div className="h-[640px]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onConnect={handleConnect}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  fitView
                >
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Стартовый шаг</Label>
                <Select
                  value={definition.config.initial_step_id}
                  onValueChange={(value) =>
                    setDefinition({
                      ...definition,
                      config: { ...definition.config, initial_step_id: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {definition.config.steps.map((step) => (
                      <SelectItem key={step.step_id} value={step.step_id}>
                        {step.step_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {validation && (
                <Alert
                  className={
                    validation.isValid
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-destructive/30 bg-destructive/10 text-destructive'
                  }
                >
                  <AlertDescription>
                    {validation.isValid ? (
                      'Валидация пройдена'
                    ) : (
                      <div>
                        <div className="font-medium mb-2">Ошибки:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {(selectedStep || selectedProfile) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Редактор узла</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStep && (
                  <>
                    <div className="space-y-2">
                      <Label>Текст вопроса</Label>
                      <Textarea
                        value={selectedStep.question_text}
                        onChange={(event) =>
                          updateStep(selectedStep.step_id, (step) => ({
                            ...step,
                            question_text: event.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(selectedStep.crisis_trigger)}
                        onCheckedChange={(checked) =>
                          updateStep(selectedStep.step_id, (step) => ({
                            ...step,
                            crisis_trigger: Boolean(checked),
                          }))
                        }
                      />
                      Кризисный триггер
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Варианты</h3>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="px-0"
                          onClick={() => addChoice(selectedStep.step_id)}
                        >
                          Добавить вариант
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {selectedStep.choices.map((choice) => (
                          <div key={choice.choice_id} className="rounded border border-border p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{choice.choice_id}</span>
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="px-0 text-destructive"
                                onClick={() => removeChoice(selectedStep.step_id, choice.choice_id)}
                              >
                                Удалить
                              </Button>
                            </div>
                            <Input
                              type="text"
                              value={choice.text}
                              onChange={(event) =>
                                updateStep(selectedStep.step_id, (step) => ({
                                  ...step,
                                  choices: step.choices.map((item) =>
                                    item.choice_id === choice.choice_id ? { ...item, text: event.target.value } : item,
                                  ),
                                }))
                              }
                              placeholder="Текст варианта"
                            />
                            <select
                              value={
                                choice.next_step_id
                                  ? `step:${choice.next_step_id}`
                                  : choice.result_profile_id
                                  ? `result:${choice.result_profile_id}`
                                  : ''
                              }
                              onChange={(event) => {
                                const value = event.target.value;
                                updateStep(selectedStep.step_id, (step) => ({
                                  ...step,
                                  choices: step.choices.map((item) => {
                                    if (item.choice_id !== choice.choice_id) return item;
                                    if (!value) {
                                      return { ...item, next_step_id: null, result_profile_id: undefined };
                                    }
                                    const [kind, idValue] = value.split(':');
                                    return {
                                      ...item,
                                      next_step_id: kind === 'step' ? idValue : null,
                                      result_profile_id: kind === 'result' ? idValue : undefined,
                                    };
                                  }),
                                }));
                              }}
                              className="w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground"
                            >
                              <option value="">Без связи</option>
                              <optgroup label="Шаги">
                                {definition.config.steps.map((step) => (
                                  <option key={step.step_id} value={`step:${step.step_id}`}>
                                    {step.step_id}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Профили результата">
                                {definition.config.result_profiles.map((profile) => (
                                  <option key={profile.id} value={`result:${profile.id}`}>
                                    {profile.id}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {selectedProfile && (
                  <>
                    <div className="space-y-2">
                      <Label>Заголовок</Label>
                      <Input
                        type="text"
                        value={selectedProfile.title}
                        onChange={(event) =>
                          updateResultProfile(selectedProfile.id, (profile) => ({
                            ...profile,
                            title: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={selectedProfile.description}
                        onChange={(event) =>
                          updateResultProfile(selectedProfile.id, (profile) => ({
                            ...profile,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <Label>CTA текст</Label>
                        <Input
                          type="text"
                          value={selectedProfile.cta?.text || ''}
                          onChange={(event) =>
                            updateResultProfile(selectedProfile.id, (profile) => ({
                              ...profile,
                              cta: { text: event.target.value, link: profile.cta?.link || '' },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA ссылка</Label>
                        <Input
                          type="text"
                          value={selectedProfile.cta?.link || ''}
                          onChange={(event) =>
                            updateResultProfile(selectedProfile.id, (profile) => ({
                              ...profile,
                              cta: { text: profile.cta?.text || '', link: event.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label>Рекомендации (каждая с новой строки)</Label>
                      <Textarea
                        value={selectedProfile.recommendations?.articles?.join('\n') || ''}
                        onChange={(event) =>
                          updateResultProfile(selectedProfile.id, (profile) => ({
                            ...profile,
                            recommendations: {
                              ...profile.recommendations,
                              articles: event.target.value.split('\n').filter((item) => item.trim()),
                            },
                          }))
                        }
                        rows={2}
                        placeholder="Статьи"
                      />
                      <Textarea
                        value={selectedProfile.recommendations?.exercises?.join('\n') || ''}
                        onChange={(event) =>
                          updateResultProfile(selectedProfile.id, (profile) => ({
                            ...profile,
                            recommendations: {
                              ...profile.recommendations,
                              exercises: event.target.value.split('\n').filter((item) => item.trim()),
                            },
                          }))
                        }
                        rows={2}
                        placeholder="Упражнения"
                      />
                      <Textarea
                        value={selectedProfile.recommendations?.resources?.join('\n') || ''}
                        onChange={(event) =>
                          updateResultProfile(selectedProfile.id, (profile) => ({
                            ...profile,
                            recommendations: {
                              ...profile.recommendations,
                              resources: event.target.value.split('\n').filter((item) => item.trim()),
                            },
                          }))
                        }
                        rows={2}
                        placeholder="Ресурсы"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Версии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionError && (
                <Alert variant="destructive">
                  <AlertDescription>{versionError}</AlertDescription>
                </Alert>
              )}
              {versions.length === 0 && (
                <div className="text-sm text-muted-foreground">Нет опубликованных версий.</div>
              )}
              {versions.length > 0 && (
                <>
                  <Select
                    value={selectedVersion ? String(selectedVersion) : ''}
                    onValueChange={(value) => {
                      const version = Number(value);
                      setSelectedVersion(version);
                      fetchVersionConfig(version);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.id} value={String(version.version)}>
                          v{version.version} · {new Date(version.createdAt).toLocaleString('ru-RU')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {diffSummary.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {diffSummary.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">Отличий не найдено.</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}
