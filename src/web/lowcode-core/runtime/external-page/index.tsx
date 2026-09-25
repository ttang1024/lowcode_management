import React from 'react';

export default function ExternalPage(props:{ data:PageConfigurerModel }) {
  switch (Number(props.data.pageType)) {
    case 2:
      // iframe
      return (<iframe frameBorder="no" className="external-iframe-page box-border size-full border-0" src={props.data.pageOption}></iframe>);
    default:
      return null;
  }
}