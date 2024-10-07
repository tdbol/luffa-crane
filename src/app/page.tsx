"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function Component() {
  const [boomEnd, setBoomEnd] = useState({ x: 400, y: 100 });
  const [basePosition, setBasePosition] = useState({ x: 100, y: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingBase, setIsDraggingBase] = useState(false);
  const [gridSize, setGridSize] = useState(40);
  const [boomAttachment, setBoomAttachment] = useState(4);
  const [measurementSize, setMeasurementSize] = useState(2);
  const [baseWidth, setBaseWidth] = useState(9);
  const [baseHeight, setBaseHeight] = useState(2);
  const [object, setObject] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [isResizingObject, setIsResizingObject] = useState(null);
  const [ropeLength, setRopeLength] = useState(6);
  const [isDraggingHook, setIsDraggingHook] = useState(false);
  const [flyJib, setFlyJib] = useState(null);
  const [isDraggingFlyJib, setIsDraggingFlyJib] = useState(false);
  const [isDraggingFlyJibPivot, setIsDraggingFlyJibPivot] = useState(false);
  const [radiusOffset, setRadiusOffset] = useState(0.8);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [riggingLength, setRiggingLength] = useState(3);
  const [loadWidth, setLoadWidth] = useState(3);
  const [loadHeight, setLoadHeight] = useState(3);
  const [loadWeight, setLoadWeight] = useState(1000);
  const [showRiggingAndLoad, setShowRiggingAndLoad] = useState(false);
  const [craneColor, setCraneColor] = useState("silver");
  const [verticalMeasurementX, setVerticalMeasurementX] = useState(60);
  const [isDraggingVerticalMeasurement, setIsDraggingVerticalMeasurement] = useState(false);
  const [isDraggingLoad, setIsDraggingLoad] = useState(false);
  const [isDraggingBoomPivot, setIsDraggingBoomPivot] = useState(false);
  const [boomLengthInput, setBoomLengthInput] = useState('');
  const [boomAngleInput, setBoomAngleInput] = useState('');
  const [flyJibLengthInput, setFlyJibLengthInput] = useState('');
  const [flyJibAngleInput, setFlyJibAngleInput] = useState('');
  const [horizontalSliderValue, setHorizontalSliderValue] = useState(50);
  const [verticalSliderValue, setVerticalSliderValue] = useState(50);
  const [controlMode, setControlMode] = useState('boom');
  const svgRef = useRef(null);

  const svgSize = 400;
  const sliderWidth = 20;
  const sliderMargin = 5;

  const pixelsPerMeter = svgSize / gridSize;
  const baseSVGWidth = baseWidth * pixelsPerMeter;
  const baseSVGHeight = baseHeight * pixelsPerMeter;
  const boomAttachmentX = basePosition.x + baseSVGWidth - (boomAttachment * pixelsPerMeter);
  const boomBaseY = basePosition.y;

  const boomAngle = Math.atan2(boomBaseY - boomEnd.y, boomEnd.x - boomAttachmentX);
  const boomLength = Math.sqrt(Math.pow(boomEnd.x - boomAttachmentX, 2) + Math.pow(boomEnd.y - boomBaseY, 2)) / pixelsPerMeter;

  const flyJibEnd = flyJib ? {
    x: boomEnd.x + Math.cos(boomAngle + flyJib.angle) * flyJib.length * pixelsPerMeter,
    y: boomEnd.y - Math.sin(boomAngle + flyJib.angle) * flyJib.length * pixelsPerMeter
  } : boomEnd;

  const hookPosition = {
    x: flyJibEnd.x,
    y: Math.min(flyJibEnd.y + ropeLength * pixelsPerMeter, svgSize - pixelsPerMeter / 2)
  };

  const loadPosition = {
    x: hookPosition.x - (loadWidth * pixelsPerMeter) / 2,
    y: hookPosition.y + riggingLength * pixelsPerMeter
  };

  const riggingAngle = 2 * Math.asin(loadWidth / (2 * riggingLength));

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(svgSize, e.clientX - svgRect.left));
        const y = Math.max(0, Math.min(svgSize, e.clientY - svgRect.top));
        
        if (isDragging) {
          setBoomEnd({ x, y });
        } else if (isDraggingBase) {
          setBasePosition({ 
            x: Math.max(0, Math.min(svgSize - baseSVGWidth, x)), 
            y: Math.min(svgSize - baseSVGHeight, y) 
          });
        } else if (isDraggingObject && object) {
          setObject({
            ...object,
            x: Math.max(0, Math.min(svgSize - object.width, x)),
            y: Math.max(0, Math.min(svgSize - object.height, y))
          });
        } else if (isResizingObject && object) {
          const newObject = { ...object };
          if (isResizingObject === 'left') {
            const newWidth = object.x + object.width - x;
            newObject.x = Math.max(0, x);
            newObject.width = Math.max(pixelsPerMeter, newWidth);
          } else if (isResizingObject === 'right') {
            newObject.width = Math.max(pixelsPerMeter, Math.min(svgSize - object.x, x - object.x));
          } else if (isResizingObject === 'top') {
            const newHeight = object.y + object.height - y;
            newObject.y = Math.max(0, y);
            newObject.height = Math.max(pixelsPerMeter, newHeight);
          } else if (isResizingObject === 'bottom') {
            newObject.height = Math.max(pixelsPerMeter, Math.min(svgSize - object.y, y - object.y));
          }
          setObject(newObject);
        } else if (isDraggingHook) {
          const newHookPosition = {
            x: x,
            y: Math.min(y, svgSize - pixelsPerMeter / 2)
          };
          const dx = newHookPosition.x - flyJibEnd.x;
          const dy = newHookPosition.y - flyJibEnd.y;
          const newRopeLength = Math.sqrt(dx * dx + dy * dy) / pixelsPerMeter;
          setRopeLength(newRopeLength);
        } else if (isDraggingFlyJib && flyJib) {
          const dx = x - boomEnd.x;
          const dy = y - boomEnd.y;
          const angle = Math.atan2(-dy, dx) - boomAngle;
          const length = Math.sqrt(dx * dx + dy * dy) / pixelsPerMeter;
          setFlyJib({
            angle: angle,
            length: length
          });
        } else if (isDraggingFlyJibPivot && flyJib) {
          const dx = x - boomEnd.x;
          const dy = y - boomEnd.y;
          const newAngle = Math.atan2(-dy, dx) - boomAngle;
          setFlyJib({
            ...flyJib,
            angle: newAngle
          });
        } else if (isDraggingVerticalMeasurement) {
          setVerticalMeasurementX(Math.max(0, Math.min(svgSize, x)));
        } else if (isDraggingLoad) {
          const newRiggingLength = Math.max(0, (y - hookPosition.y) / pixelsPerMeter);
          setRiggingLength(newRiggingLength);
        } else if (isDraggingBoomPivot) {
          const dx = x - boomAttachmentX;
          const dy = boomBaseY - y;
          const newAngle = Math.atan2(dy, dx);
          const newBoomEnd = {
            x: boomAttachmentX + Math.cos(newAngle) * boomLength * pixelsPerMeter,
            y: boomBaseY - Math.sin(newAngle) * boomLength * pixelsPerMeter
          };
          setBoomEnd(newBoomEnd);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsDraggingBase(false);
      setIsDraggingObject(false);
      setIsResizingObject(null);
      setIsDraggingHook(false);
      setIsDraggingFlyJib(false);
      setIsDraggingFlyJibPivot(false);
      setIsDraggingVerticalMeasurement(false);
      setIsDraggingLoad(false);
      setIsDraggingBoomPivot(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isDraggingBase, isDraggingObject, isResizingObject, isDraggingHook, isDraggingFlyJib, isDraggingFlyJibPivot, isDraggingVerticalMeasurement, isDraggingLoad, isDraggingBoomPivot, svgSize, baseSVGWidth, baseSVGHeight, object, boomEnd, pixelsPerMeter, flyJib, boomAngle, flyJibEnd.y, hookPosition.y, boomAttachmentX, boomBaseY, boomLength]);

  const handleMouseDown = () => setIsDragging(true);
  const handleBaseMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingBase(true);
  };
  const handleObjectMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingObject(true);
  };
  const handleObjectResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizingObject(direction);
  };
  const handleHookMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingHook(true);
  };
  const handleFlyJibMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingFlyJib(true);
  };
  const handleFlyJibPivotMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingFlyJibPivot(true);
  };
  const handleVerticalMeasurementMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingVerticalMeasurement(true);
  };
  const handleLoadMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingLoad(true);
  };
  const handleBoomPivotMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingBoomPivot(true);
  };

  const handleHookDoubleClick = (e) => {
    e.stopPropagation();
    setShowRiggingAndLoad(!showRiggingAndLoad);
  };

  const handleBoomDoubleClick = (e) => {
    e.stopPropagation();
    if (!flyJib) {
      setFlyJib({
        angle: -Math.PI / 6,
        length: 5
      });
    }
  };

  const handleGridSizeChange = (e) => {
    const newGridSize = Number(e.target.value);
    const scaleFactor = gridSize / newGridSize;
    
    setGridSize(newGridSize);
    setBoomEnd(prev => ({ x: prev.x * scaleFactor, y: prev.y * scaleFactor }));
    setBasePosition(prev => ({ x: prev.x * scaleFactor, y: prev.y * scaleFactor }));
    if (object) {
      setObject(prev => ({
        ...prev,
        x: prev.x * scaleFactor,
        y: prev.y * scaleFactor,
        width: prev.width * scaleFactor,
        height: prev.height * scaleFactor
      }));
    }
    if (flyJib) {
      setFlyJib(prev => ({ ...prev, length: prev.length * scaleFactor }));
    }
    setRopeLength(prev => prev * scaleFactor);
    setRiggingLength(prev => prev * scaleFactor);
    setLoadWidth(prev => prev * scaleFactor);
    setLoadHeight(prev => prev * scaleFactor);
    setVerticalMeasurementX(prev => prev * scaleFactor);
  };

  const handleBoomAttachmentChange = (e) => setBoomAttachment(Number(e.target.value));
  const handleMeasurementSizeChange = (e) => setMeasurementSize(Number(e.target.value));
  const handleBaseWidthChange = (e) => setBaseWidth(Number(e.target.value));
  const handleBaseHeightChange = (e) => {
    const newHeight = Number(e.target.value);
    const heightDifference = newHeight - baseHeight;
    setBaseHeight(newHeight);
    setBasePosition(prev => ({ ...prev, y: prev.y - heightDifference * pixelsPerMeter }));
  };
  const handleRopeLengthChange = (e) => setRopeLength(Number(e.target.value));
  const handleRadiusOffsetChange = (e) => setRadiusOffset(Number(e.target.value));
  const handleRiggingLengthChange = (e) => setRiggingLength(Number(e.target.value));
  const handleLoadWidthChange = (e) => setLoadWidth(Number(e.target.value));
  const handleLoadHeightChange = (e) => setLoadHeight(Number(e.target.value));
  const handleLoadWeightChange = (e) => setLoadWeight(Number(e.target.value));

  const handleAddObject = () => {
    setObject({ x: 100, y: svgSize - 50, width: 50, height: 50 });
  };

  const handleObjectSizeChange = (dimension, value) => {
    setObject(prev => {
      const newSize = Number(value) * pixelsPerMeter;
      if (dimension === 'height') {
        return { ...prev, [dimension]: newSize, y: prev.y - (newSize - prev.height) };
      }
      return { ...prev, [dimension]: newSize };
    });
  };

  const handleDeleteObject = () => {
    setObject(null);
  };

  const handleDeleteFlyJib = () => {
    setFlyJib(null);
  };

  const handleToggleRiggingAndLoad = () => {
    setShowRiggingAndLoad(!showRiggingAndLoad);
  };

  const handleBoomLengthChange = () => {
    const newLength = Number(boomLengthInput);
    if (!isNaN(newLength) && newLength > 0) {
      const newBoomEnd = {
        x: boomAttachmentX + Math.cos(boomAngle) * newLength * pixelsPerMeter,
        y: boomBaseY - Math.sin(boomAngle) * newLength * pixelsPerMeter
      };
      setBoomEnd(newBoomEnd);
    }
  };

  const handleBoomAngleChange = () => {
    const newAngle = Number(boomAngleInput) * Math.PI / 180;
    if (!isNaN(newAngle)) {
      const newBoomEnd = {
        x: boomAttachmentX + Math.cos(newAngle) * boomLength * pixelsPerMeter,
        y: boomBaseY - Math.sin(newAngle) * boomLength * pixelsPerMeter
      };
      setBoomEnd(newBoomEnd);
    }
  };

  const handleFlyJibLengthChange = () => {
    const newLength = Number(flyJibLengthInput);
    if (!isNaN(newLength) && newLength > 0 && flyJib) {
      setFlyJib({ ...flyJib, length: newLength });
    }
  };

  const handleFlyJibAngleChange = () => {
    const newAngle = Number(flyJibAngleInput) * Math.PI / 180;
    if (!isNaN(newAngle) && flyJib) {
      setFlyJib({ ...flyJib, angle: newAngle });
    }
  };

  const handleHorizontalSliderChange = (value) => {
    setHorizontalSliderValue(value[0]);
    if (controlMode === 'boom') {
      const newAngle = (value[0] / 100) * Math.PI;
      const newBoomEnd = {
        x: boomAttachmentX + Math.cos(newAngle) * boomLength * pixelsPerMeter,
        y: boomBaseY - Math.sin(newAngle) * boomLength * pixelsPerMeter
      };
      setBoomEnd(newBoomEnd);
    } else if (controlMode === 'flyJib' && flyJib) {
      const newAngle = ((value[0] / 100) * Math.PI) - (Math.PI / 2);
      setFlyJib({ ...flyJib, angle: newAngle });
    } else if (controlMode === 'hookAndLoad') {
      const newLoadX = ((value[0] / 100) * (svgSize - loadWidth * pixelsPerMeter)) + (loadWidth * pixelsPerMeter / 2);
      const newHookX = newLoadX;
      const dx = newHookX - flyJibEnd.x;
      const dy = hookPosition.y - flyJibEnd.y;
      const newRopeLength = Math.sqrt(dx * dx + dy * dy) / pixelsPerMeter;
      setRopeLength(newRopeLength);
    }
  };

  const handleVerticalSliderChange = (value) => {
    setVerticalSliderValue(value[0]);
    if (controlMode === 'boom') {
      const newLength = (value[0] / 100) * gridSize;
      const newBoomEnd = {
        x: boomAttachmentX + Math.cos(boomAngle) * newLength * pixelsPerMeter,
        y: boomBaseY - Math.sin(boomAngle) * newLength * pixelsPerMeter
      };
      setBoomEnd(newBoomEnd);
    } else if (controlMode === 'flyJib' && flyJib) {
      const newLength = (value[0] / 100) * gridSize / 2; // Assuming fly jib is max half the grid size
      setFlyJib({ ...flyJib, length: newLength });
    } else if (controlMode === 'hookAndLoad') {
      const newHookY = ((100 - value[0]) / 100) * (svgSize - pixelsPerMeter / 2);
      const newLoadY = newHookY + riggingLength * pixelsPerMeter;
      setRopeLength((newHookY - flyJibEnd.y) / pixelsPerMeter);
    }
  };

  const Measurement = ({ start, end, label, isVertical, color = "blue", dashed = false, offsetY = 0, offsetX = 0 }) => {
    if (!showMeasurements) return null;
    const labelOffset = pixelsPerMeter / 2;
    const midPoint = {
      x: (start.x + end.x) / 2 + offsetX,
      y: (start.y + end.y) / 2 + offsetY
    };

    return (
      <text
        x={isVertical ? midPoint.x + labelOffset : midPoint.x}
        y={isVertical ? midPoint.y : midPoint.y - labelOffset}
        fill="black"
        fontSize={pixelsPerMeter / 2 * measurementSize}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    );
  };

  const radiusStartX = boomAttachmentX + radiusOffset * pixelsPerMeter;

  const calculateObjectDistance = () => {
    if (!object) return null;
    const craneRightEdge = basePosition.x + baseSVGWidth;
    const objectLeftEdge = object.x;
    const distance = Math.max(0, (objectLeftEdge - craneRightEdge) / pixelsPerMeter);
    return distance;
  };

  const objectDistance = calculateObjectDistance();

  useEffect(() => {
    // Set initial boom length and angle
    const initialBoomLength = 30;
    const initialBoomAngle = 65 * Math.PI / 180;
    const newBoomEnd = {
      x: boomAttachmentX + Math.cos(initialBoomAngle) * initialBoomLength * pixelsPerMeter,
      y: boomBaseY - Math.sin(initialBoomAngle) * initialBoomLength * pixelsPerMeter
    };
    setBoomEnd(newBoomEnd);
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative" style={{ width: svgSize + sliderWidth + sliderMargin, height: svgSize + sliderWidth + sliderMargin }}>
        <svg 
          ref={svgRef}
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`} 
        >
          {/* Grid */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1="0" y1={i * pixelsPerMeter} x2={svgSize} y2={i * pixelsPerMeter} stroke="#ddd" strokeWidth="0.5" />
              <line x1={i * pixelsPerMeter} y1="0" x2={i * pixelsPerMeter} y2={svgSize} stroke="#ddd" strokeWidth="0.5" />
            </React.Fragment>
          ))}
          
          {/* Title */}
          <text
            x={svgSize / 2}
            y={30}
            fontSize={24}
            fontWeight="bold"
            textAnchor="middle"
            fill="black"
          >
            Luffa
          </text>
          
          {/* Ground */}
          <line 
            x1="0" 
            y1={svgSize} 
            x2={svgSize} 
            y2={svgSize} 
            stroke="brown" 
            strokeWidth={pixelsPerMeter / 2} 
          />
          
          {/* Base */}
          <rect 
            x={basePosition.x} 
            y={basePosition.y} 
            width={baseSVGWidth} 
            height={baseSVGHeight} 
            fill={craneColor} 
            onMouseDown={handleBaseMouseDown}
            style={{cursor: 'move'}}
          />
          
          {/* Boom */}
          <line 
            x1={boomAttachmentX} 
            y1={boomBaseY} 
            x2={boomEnd.x} 
            y2={boomEnd.y} 
            stroke={craneColor} 
            strokeWidth={pixelsPerMeter / 2} 
          />
          
          {/* Boom drag area */}
          <circle
            cx={boomEnd.x}
            cy={boomEnd.y}
            r={pixelsPerMeter}
            fill="red"
            fillOpacity={0.2}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleBoomDoubleClick}
            style={{cursor: 'move'}}
          />
          
          {/* Boom pivot drag area */}
          <circle
            cx={boomAttachmentX + Math.cos(boomAngle) * boomLength * pixelsPerMeter * 0.2}
            cy={boomBaseY - Math.sin(boomAngle) * boomLength * pixelsPerMeter * 0.2}
            r={pixelsPerMeter}
            fill="green"
            fillOpacity={0.2}
            onMouseDown={handleBoomPivotMouseDown}
            style={{cursor: 'move'}}
          />
          
          {/* Fly Jib */}
          {flyJib && (
            <>
              <line
                x1={boomEnd.x}
                y1={boomEnd.y}
                x2={flyJibEnd.x}
                y2={flyJibEnd.y}
                stroke={craneColor}
                strokeWidth={pixelsPerMeter / 3}
              />
              {/* Fly Jib drag area */}
              <circle
                cx={flyJibEnd.x}
                cy={flyJibEnd.y}
                r={pixelsPerMeter}
                fill="red"
                fillOpacity={0.2}
                onMouseDown={handleFlyJibMouseDown}
                style={{cursor: 'move'}}
              />
              {/* Fly Jib pivot drag area */}
              <circle
                cx={boomEnd.x + Math.cos(boomAngle + flyJib.angle) * flyJib.length * pixelsPerMeter * 0.2}
                cy={boomEnd.y - Math.sin(boomAngle + flyJib.angle) * flyJib.length * pixelsPerMeter * 0.2}
                r={pixelsPerMeter}
                fill="green"
                fillOpacity={0.2}
                onMouseDown={handleFlyJibPivotMouseDown}
                style={{cursor: 'move'}}
              />
            </>
          )}
          
          {/* Rope */}
          <line
            x1={flyJibEnd.x}
            y1={flyJibEnd.y}
            x2={hookPosition.x}
            y2={hookPosition.y}
            stroke="gray"
            strokeWidth={pixelsPerMeter / 10}
          />
          
          {/* Hook and drag area */}
          <circle 
            cx={hookPosition.x} 
            cy={hookPosition.y} 
            r={pixelsPerMeter} 
            fill="red"
            fillOpacity={0.2}
            onMouseDown={handleHookMouseDown}
            onDoubleClick={handleHookDoubleClick}
            style={{cursor: 'move'}}
          />
          <circle 
            cx={hookPosition.x} 
            cy={hookPosition.y} 
            r={pixelsPerMeter / 4} 
            fill="gray"
          />

          {/* Rigging and Load */}
          {showRiggingAndLoad && (
            <>
              {/* Rigging */}
              <line
                x1={hookPosition.x}
                y1={hookPosition.y}
                x2={loadPosition.x}
                y2={loadPosition.y}
                stroke="blue"
                strokeWidth={pixelsPerMeter / 20}
              />
              <line
                x1={hookPosition.x}
                y1={hookPosition.y}
                x2={loadPosition.x + loadWidth * pixelsPerMeter}
                y2={loadPosition.y}
                stroke="blue"
                strokeWidth={pixelsPerMeter / 20}
              />
              {/* Load */}
              <rect
                x={loadPosition.x}
                y={loadPosition.y}
                width={loadWidth * pixelsPerMeter}
                height={loadHeight * pixelsPerMeter}
                fill="orange"
                stroke="black"
                strokeWidth={pixelsPerMeter / 20}
              />
              {/* Load drag area */}
              <circle
                cx={loadPosition.x + (loadWidth * pixelsPerMeter) / 2}
                cy={loadPosition.y + (loadHeight * pixelsPerMeter) / 2}
                r={pixelsPerMeter}
                fill="red"
                fillOpacity={0.2}
                onMouseDown={handleLoadMouseDown}
                style={{cursor: 'ns-resize'}}
              />
              {/* Load Weight */}
              <text
                x={loadPosition.x + (loadWidth * pixelsPerMeter) + pixelsPerMeter / 2}
                y={loadPosition.y + (loadHeight * pixelsPerMeter) / 2}
                fill="black"
                fontSize={pixelsPerMeter / 2 * measurementSize}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {`${loadWeight.toFixed(2)} kg`}
              </text>
              {/* Rigging Angle */}
              <text
                x={hookPosition.x + pixelsPerMeter * 2}
                y={hookPosition.y}
                fill="black"
                fontSize={pixelsPerMeter / 2 * measurementSize}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {`${(riggingAngle * 180 / Math.PI).toFixed(2)}°`}
              </text>
              {/* Rigging Length Measurement */}
              <Measurement
                start={hookPosition}
                end={loadPosition}
                label={`${riggingLength.toFixed(2)}m`}
                isVertical={true}
                color="blue"
                offsetX={pixelsPerMeter * 2}
              />
            </>
          )}

          {/* Measurements */}
          <Measurement
            start={{ x: boomAttachmentX, y: boomBaseY }}
            end={boomEnd}
            label={`${boomLength.toFixed(2)}m`}
            isVertical={false}
            color="gray"
            offsetX={pixelsPerMeter * 2}
          />
          {flyJib && (
            <Measurement
              start={boomEnd}
              end={flyJibEnd}
              label={`${flyJib.length.toFixed(2)}m`}
              isVertical={false}
              color="red"
              offsetX={pixelsPerMeter * 2}
            />
          )}
          <Measurement
            start={flyJibEnd}
            end={hookPosition}
            label={`${ropeLength.toFixed(2)}m`}
            isVertical={true}
            color="gray"
            offsetX={pixelsPerMeter * 2}
          />

          {/* Running Radius Measurement */}
          <Measurement
            start={{ x: radiusStartX, y: svgSize - pixelsPerMeter }}
            end={{ x: hookPosition.x, y: svgSize - pixelsPerMeter }}
            label={`${((hookPosition.x - radiusStartX) / pixelsPerMeter).toFixed(2)}m`}
            isVertical={false}
            color="blue"
          />

          {/* Vertical Measurement */}
          <Measurement
            start={{ x: verticalMeasurementX, y: svgSize }}
            end={{ x: verticalMeasurementX, y: Math.min(flyJibEnd.y, boomEnd.y) }}
            label={`${((svgSize - Math.min(flyJibEnd.y, boomEnd.y)) / pixelsPerMeter).toFixed(2)}m`}
            isVertical={true}
            color="green"
          />
          {/* Vertical Measurement drag area */}
          <circle
            cx={verticalMeasurementX}
            cy={Math.min(flyJibEnd.y, boomEnd.y)}
            r={pixelsPerMeter / 2}
            fill="red"
            fillOpacity={0.2}
            onMouseDown={handleVerticalMeasurementMouseDown}
            style={{cursor: 'ew-resize'}}
          />

          {/* Boom Angle */}
          {showMeasurements && (
            <text
              x={boomAttachmentX + 45 * Math.cos(boomAngle / 2)}
              y={boomBaseY - 45 * Math.sin(boomAngle / 2)}
              fill="black"
              fontSize={pixelsPerMeter / 2 * measurementSize}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {(boomAngle * 180 / Math.PI).toFixed(2)}°
            </text>
          )}

          {/* Fly Jib Angle */}
          {flyJib && showMeasurements && (
            <text
              x={boomEnd.x - 30 * Math.cos(boomAngle + flyJib.angle / 2)}
              y={boomEnd.y + 30 * Math.sin(boomAngle + flyJib.angle / 2)}
              fill="black"
              fontSize={pixelsPerMeter / 2 * measurementSize}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {(flyJib.angle * 180 / Math.PI).toFixed(2)}°
            </text>
          )}

          {/* Object */}
          {object && (
            <g>
              <rect
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height}
                fill="rgba(255, 0, 0, 0.5)"
                onMouseDown={handleObjectMouseDown}
                style={{cursor: 'move'}}
              />
              {/* Object resize handles */}
              <rect x={object.x - 5} y={object.y + object.height / 2 - 5} width={10} height={10} fill="blue" onMouseDown={(e) => handleObjectResizeMouseDown(e, 'left')} style={{cursor: 'ew-resize'}} />
              <rect x={object.x + object.width - 5} y={object.y + object.height / 2 - 5} width={10} height={10}  fill="blue" onMouseDown={(e) => handleObjectResizeMouseDown(e, 'right')} style={{cursor: 'ew-resize'}} />
              <rect x={object.x + object.width / 2 - 5} y={object.y - 5} width={10} height={10} fill="blue" onMouseDown={(e) => handleObjectResizeMouseDown(e, 'top')} style={{cursor: 'ns-resize'}} />
              <rect x={object.x + object.width / 2 - 5} y={object.y + object.height - 5} width={10} height={10} fill="blue" onMouseDown={(e) => handleObjectResizeMouseDown(e, 'bottom')} style={{cursor: 'ns-resize'}} />
              <Measurement
                start={{ x: object.x, y: object.y + object.height }}
                end={{ x: object.x + object.width, y: object.y + object.height }}
                label={`${(object.width / pixelsPerMeter).toFixed(2)}m`}
                isVertical={false}
                color="red"
                offsetX={pixelsPerMeter * 2}
              />
              <Measurement
                start={{ x: object.x + object.width, y: object.y }}
                end={{ x: object.x + object.width, y: object.y + object.height }}
                label={`${(object.height / pixelsPerMeter).toFixed(2)}m`}
                isVertical={true}
                color="red"
                offsetX={pixelsPerMeter * 2}
              />
              {/* Object Distance Measurement */}
              <Measurement
                start={{ x: basePosition.x + baseSVGWidth, y: svgSize - 2.5 * pixelsPerMeter }}
                end={{ x: object.x, y: svgSize - 2.5 * pixelsPerMeter }}
                label={`${objectDistance.toFixed(2)}m`}
                isVertical={false}
                color="purple"
                dashed={true}
              />
            </g>
          )}

          {/* New Visual Lines */}
          {/* Vertical Measurement Line */}
          <line
            x1={verticalMeasurementX}
            y1={svgSize}
            x2={verticalMeasurementX}
            y2={Math.min(flyJibEnd.y, boomEnd.y)}
            stroke="green"
            strokeWidth={pixelsPerMeter / 20}
            strokeDasharray="5,5"
          />

          {/* Radius Measurement Line (1 meter above ground) */}
          <line
            x1={radiusStartX}
            y1={svgSize - pixelsPerMeter}
            x2={hookPosition.x}
            y2={svgSize - pixelsPerMeter}
            stroke="blue"
            strokeWidth={pixelsPerMeter / 20}
            strokeDasharray="5,5"
          />

          {/* Crane to Object Measurement Line (2.5 meters above ground) */}
          {object && (
            <line
              x1={basePosition.x + baseSVGWidth}
              y1={svgSize - 2.5 * pixelsPerMeter}
              x2={object.x}
              y2={svgSize - 2.5 * pixelsPerMeter}
              stroke="purple"
              strokeWidth={pixelsPerMeter / 20}
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Horizontal Slider (Boom Pivot Angle) */}
        <div className="absolute left-0 right-0" style={{ bottom: -sliderWidth - sliderMargin, width: svgSize }}>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[horizontalSliderValue]}
            onValueChange={handleHorizontalSliderChange}
            className="w-full"
          />
        </div>

        {/* Vertical Slider (Boom Length) */}
        <div className="absolute top-0 bottom-0" style={{ left: svgSize + sliderMargin, width: sliderWidth, height: svgSize }}>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[verticalSliderValue]}
            onValueChange={handleVerticalSliderChange}
            className="h-full"
            orientation="vertical"
          />
        </div>
      </div>
      
      <div className="mt-8 space-y-4 w-full max-w-md">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-measurements"
            checked={showMeasurements}
            onCheckedChange={setShowMeasurements}
          />
          <Label htmlFor="show-measurements">Show Measurements</Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="craneColor" className="block text-sm font-medium text-gray-700">Crane Color:</label>
            <Select value={craneColor} onValueChange={setCraneColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="gridSize" className="block text-sm font-medium text-gray-700">Grid Size (meters):</label>
            <Input 
              id="gridSize"
              type="number" 
              min="10" 
              max="100" 
              value={gridSize} 
              onChange={handleGridSizeChange}
            />
          </div>
          <div>
            <label htmlFor="boomAttachment" className="block text-sm font-medium text-gray-700">Boom Attachment (m from right):</label>
            <Input 
              id="boomAttachment"
              type="number" 
              min="0" 
              max={baseWidth} 
              step="0.1"
              value={boomAttachment} 
              onChange={handleBoomAttachmentChange}
            />
          </div>
          <div>
            <label htmlFor="measurementSize" className="block text-sm font-medium text-gray-700">Measurement Size:</label>
            <Input 
              id="measurementSize"
              type="number" 
              min="0.5" 
              max="5" 
              step="0.1"
              value={measurementSize} 
              onChange={handleMeasurementSizeChange}
            />
          </div>
          <div>
            <label htmlFor="baseWidth" className="block text-sm font-medium text-gray-700">Crane Base Width (m):</label>
            <Input 
              id="baseWidth"
              type="number" 
              min="1" 
              max="20" 
              step="0.1"
              value={baseWidth} 
              onChange={handleBaseWidthChange}
            />
          </div>
          <div>
            <label htmlFor="baseHeight" className="block text-sm font-medium text-gray-700">Crane Base Height (m):</label>
            <Input 
              id="baseHeight"
              type="number" 
              min="1" 
              max="10" 
              step="0.1"
              value={baseHeight} 
              onChange={handleBaseHeightChange}
            />
          </div>
          <div>
            <label htmlFor="ropeLength" className="block text-sm font-medium text-gray-700">Rope Length (m):</label>
            <Input 
              id="ropeLength"
              type="number" 
              min="0" 
              max={gridSize} 
              step="0.1"
              value={ropeLength} 
              onChange={handleRopeLengthChange}
            />
          </div>
          <div>
            <label htmlFor="radiusOffset" className="block text-sm font-medium text-gray-700">Radius Offset (m):</label>
            <Input 
              id="radiusOffset"
              type="number" 
              min={-baseWidth} 
              max={baseWidth} 
              step="0.1"
              value={radiusOffset} 
              onChange={handleRadiusOffsetChange}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddObject}>
            Add Object
          </Button>
          {object && (
            <>
              <Input
                type="number"
                value={(object.width / pixelsPerMeter).toFixed(2)}
                onChange={(e) => handleObjectSizeChange('width', e.target.value)}
                placeholder="Width"
              />
              <Input
                type="number"
                value={(object.height / pixelsPerMeter).toFixed(2)}
                onChange={(e) => handleObjectSizeChange('height', e.target.value)}
                placeholder="Height"
              />
              <Button onClick={handleDeleteObject} variant="destructive">
                Delete Object
              </Button>
            </>
          )}
        </div>
        {flyJib && (
          <Button onClick={handleDeleteFlyJib} variant="destructive">
            Delete Fly Jib
          </Button>
        )}
        <Button onClick={handleToggleRiggingAndLoad}>
          {showRiggingAndLoad ? 'Delete Rigging and Load' : 'Add Rigging and Load'}
        </Button>
        {showRiggingAndLoad && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="riggingLength" className="block text-sm font-medium text-gray-700">Rigging Length (m):</label>
              <Input 
                id="riggingLength"
                type="number" 
                min="1" 
                max="10" 
                step="0.1"
                value={riggingLength} 
                onChange={handleRiggingLengthChange}
              />
            </div>
            <div>
              <label htmlFor="loadWidth" className="block text-sm font-medium text-gray-700">Load Width (m):</label>
              <Input 
                id="loadWidth"
                type="number" 
                min="1" 
                max="10" 
                step="0.1"
                value={loadWidth} 
                onChange={handleLoadWidthChange}
              />
            </div>
            <div>
              <label htmlFor="loadHeight" className="block text-sm font-medium text-gray-700">Load Height (m):</label>
              <Input 
                id="loadHeight"
                type="number" 
                min="1" 
                max="10" 
                step="0.1"
                value={loadHeight} 
                onChange={handleLoadHeightChange}
              />
            </div>
            <div>
              <label htmlFor="loadWeight" className="block text-sm font-medium text-gray-700">Load Weight (kg):</label>
              <Input 
                id="loadWeight"
                type="number" 
                min="1" 
                max="100000" 
                step="100"
                value={loadWeight} 
                onChange={handleLoadWeightChange}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder="Boom Length"
              value={boomLengthInput}
              onChange={(e) => setBoomLengthInput(e.target.value)}
            />
            <Button onClick={handleBoomLengthChange} className="mt-1 w-full">Set Boom Length</Button>
          </div>
          <div>
            <Input
              type="number"
              placeholder="Boom Angle"
              value={boomAngleInput}
              onChange={(e) => setBoomAngleInput(e.target.value)}
            />
            <Button onClick={handleBoomAngleChange} className="mt-1 w-full">Set Boom Angle</Button>
          </div>
          {flyJib && (
            <>
              <div>
                <Input
                  type="number"
                  placeholder="Fly Jib Length"
                  value={flyJibLengthInput}
                  onChange={(e) => setFlyJibLengthInput(e.target.value)}
                />
                <Button onClick={handleFlyJibLengthChange} className="mt-1 w-full">Set Fly Jib Length</Button>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Fly Jib Angle"
                  value={flyJibAngleInput}
                  onChange={(e) => setFlyJibAngleInput(e.target.value)}
                />
                <Button onClick={handleFlyJibAngleChange} className="mt-1 w-full">Set Fly Jib Angle</Button>
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setControlMode('boom')} variant={controlMode === 'boom' ? 'default' : 'outline'}>
            Boom
          </Button>
          <Button onClick={() => setControlMode('flyJib')} variant={controlMode === 'flyJib' ? 'default' : 'outline'}>
            Fly Jib
          </Button>
          <Button onClick={() => setControlMode('hookAndLoad')} variant={controlMode === 'hookAndLoad' ? 'default' : 'outline'}>
            Hook & Load
          </Button>
        </div>
      </div>
    </div>
  );
}