
import React from 'react';
import { ScriptSegment, GenerationStatus, AppMode } from '../types';
import CuratorOutput from './outputs/CuratorOutput';
import SeoOutput from './outputs/SeoOutput';
import VisualizerOutput from './outputs/VisualizerOutput';
import NarratorOutput from './outputs/NarratorOutput';

interface OutputSectionProps {
  segments: ScriptSegment[];
  status: GenerationStatus;
  mode: AppMode;
  onSeoTitleSelect?: (title: string) => void;
  onPushToSeo?: () => void;
  onPushToVisualizer?: () => void;
  selectedSeoTitle?: string | null;
}

const OutputSection: React.FC<OutputSectionProps> = ({ 
  segments, status, mode, onSeoTitleSelect, onPushToSeo, onPushToVisualizer, selectedSeoTitle 
}) => {
  if (segments.length === 0) return null;

  switch (mode) {
    case 'VISUALIZER':
      return <VisualizerOutput segments={segments} status={status} />;
    
    case 'SEO':
      return (
        <SeoOutput 
          segments={segments} 
          status={status} 
          selectedSeoTitle={selectedSeoTitle}
          onSeoTitleSelect={onSeoTitleSelect}
        />
      );

    case 'CURATOR':
      return <CuratorOutput segments={segments} status={status} />;

    case 'NARRATOR':
    default:
      return (
        <NarratorOutput 
          segments={segments} 
          status={status} 
          onPushToSeo={onPushToSeo}
          onPushToVisualizer={onPushToVisualizer}
        />
      );
  }
};

export default OutputSection;
