import { Button } from 'lowcode-kit';
import { AbstractForm, AbstractObject } from 'lowcode-blocks';
import dispatcher from 'lowcode-core/runtime/dispatcher';
import React, { useMemo, useState } from 'react';
import { useRouteMatch } from 'lowcode-common';
import CodeEditor from '../code-editor';

export interface ApiCallViewProps {
  api: ApiConfigurerModel
}

const record ={};

export default function ApiCallView(props: ApiCallViewProps) {
  const [action, setAction] = useState('');
  const [response, setResponse] = useState(null);
  const match = useRouteMatch();

  const groups = useMemo(() => {
    const params = props.api?.meta?.params || {};
    const makeGroup = (item: string) => ({ name: item, title: item });
    return [
      { title: 'API', name: 'api', render: <span>{props?.api?.meta?.name}</span> },
      ...(params.body || []).map(makeGroup),
      ...(params.query || []).map(makeGroup),
    ];
  }, [props.api?.meta]);

  const onSubmit = async(values: Record<string, string>) => {
    const api = {
      ...props.api,
    };
    delete api.values;
    const data = await dispatcher.api.callApi<any>(api, values, match.params || {}, values);
    setResponse(data);
  };

  return (
    <React.Fragment>
      <Button variant="primary" size="sm" onClick={() => setAction('view-api')}>
        Try the API
      </Button>
      <AbstractObject
        type="modal"
        width={800}
        title="Call API"
        record={record}
        action={action}
        onSubmit={onSubmit}
        btnSubmit={{ title: 'Call' }}
        onCancel={() => setAction('')}
      >
        <AbstractForm groups={groups} />
        <CodeEditor
          readOnly
          height={400}
          value={JSON.stringify(response || '', null, 2)}
        />
      </AbstractObject>
    </React.Fragment>
  );
}