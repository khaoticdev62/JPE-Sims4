"""Performance monitoring utilities for JPE Sims 4 Mod Translator."""

import time
import threading
from typing import Dict, Callable, Any, Optional
from functools import wraps
from dataclasses import dataclass
from datetime import datetime


@dataclass
class PerformanceMetric:
    """Data class to store performance metrics."""
    operation: str
    duration: float
    timestamp: datetime
    memory_before: Optional[int] = None
    memory_after: Optional[int] = None
    cpu_before: Optional[float] = None
    cpu_after: Optional[float] = None


class PerformanceMonitor:
    """Performance monitoring system with detailed metrics."""
    
    def __init__(self):
        self.metrics: Dict[str, PerformanceMetric] = {}
        self.lock = threading.Lock()
        self.enabled = True  # Can be disabled for production
        self.thresholds = {
            "slow_operation_ms": 1000,  # 1 second
            "very_slow_operation_ms": 5000,  # 5 seconds
            "warning_memory_mb": 100,  # 100MB
        }
    
    def start_operation(self, operation_name: str) -> Dict[str, Any]:
        """Start timing an operation."""
        if not self.enabled:
            return {"start_time": time.time()}
        
        start_time = time.perf_counter()
        
        # Get memory usage if possible
        memory_before = self._get_memory_usage()
        
        return {
            "start_time": start_time,
            "memory_before": memory_before
        }
    
    def end_operation(self, operation_name: str, context: Dict[str, Any]) -> PerformanceMetric:
        """End timing an operation and record metrics."""
        end_time = time.perf_counter()
        duration = (end_time - context["start_time"]) * 1000  # Convert to milliseconds
        
        memory_after = self._get_memory_usage() if "memory_before" in context else None
        
        metric = PerformanceMetric(
            operation=operation_name,
            duration=duration,
            timestamp=datetime.now(),
            memory_before=context.get("memory_before"),
            memory_after=memory_after
        )
        
        # Store metric with thread safety
        with self.lock:
            self.metrics[operation_name] = metric
        
        # Log warnings for slow operations
        if duration > self.thresholds["slow_operation_ms"]:
            from .diagnostics.logging import log_warning
            log_warning(f"Slow operation detected: {operation_name} took {duration:.2f}ms")
        
        if duration > self.thresholds["very_slow_operation_ms"]:
            from .diagnostics.logging import log_error
            log_error(f"Very slow operation: {operation_name} took {duration:.2f}ms")
        
        return metric
    
    def _get_memory_usage(self) -> Optional[int]:
        """Get current memory usage in bytes."""
        try:
            import psutil
            process = psutil.Process()
            return process.memory_info().rss  # Resident Set Size
        except ImportError:
            # psutil not available
            return None
    
    def get_metrics(self) -> Dict[str, PerformanceMetric]:
        """Get all recorded metrics."""
        with self.lock:
            return self.metrics.copy()
    
    def get_slow_operations(self, threshold_ms: float = None) -> Dict[str, PerformanceMetric]:
        """Get operations that took longer than the threshold."""
        if threshold_ms is None:
            threshold_ms = self.thresholds["slow_operation_ms"]
        
        with self.lock:
            return {name: metric for name, metric in self.metrics.items() 
                   if metric.duration > threshold_ms}
    
    def clear_metrics(self):
        """Clear all stored metrics."""
        with self.lock:
            self.metrics.clear()
    
    def performance_timer(self, operation_name: str):
        """Context manager for measuring performance."""
        class PerformanceTimer:
            def __enter__(timer_self):
                self.context = self.start_operation(operation_name)
                return self
            
            def __exit__(timer_self, exc_type, exc_val, exc_tb):
                self.end_operation(operation_name, self.context)
        
        return PerformanceTimer()
    
    def measure_performance(self, operation_name: str = None):
        """Decorator for measuring performance of functions."""
        def decorator(func: Callable) -> Callable:
            nonlocal operation_name
            if operation_name is None:
                operation_name = func.__name__
            
            @wraps(func)
            def wrapper(*args, **kwargs):
                context = self.start_operation(operation_name)
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    self.end_operation(operation_name, context)
            return wrapper
        return decorator


class AsyncWorker:
    """Asynchronous worker to prevent UI blocking."""
    
    def __init__(self):
        self.workers = []
        self.max_workers = 4
    
    def run_async(self, func: Callable, *args, callback: Optional[Callable] = None, **kwargs):
        """Run a function asynchronously."""
        def worker():
            try:
                result = func(*args, **kwargs)
                if callback:
                    callback(result)
            except Exception as e:
                from .diagnostics.logging import log_error
                log_error(f"Async worker error", exception=e)
        
        thread = threading.Thread(target=worker, daemon=True)
        thread.start()
        self.workers.append(thread)
        
        # Clean up completed threads
        self.workers = [t for t in self.workers if t.is_alive()]
    
    def run_with_progress(self, func: Callable, progress_callback: Callable, 
                         *args, **kwargs):
        """Run a function with progress updates."""
        def worker():
            try:
                # Assuming func accepts a progress_callback parameter
                if 'progress_callback' in kwargs:
                    kwargs['progress_callback'] = progress_callback
                else:
                    # If the function doesn't support progress callback, 
                    # we could create a wrapper that periodically calls progress
                    pass
                
                result = func(*args, **kwargs)
                progress_callback(100, "Complete")  # Final progress update
                return result
            except Exception as e:
                progress_callback(0, f"Error: {str(e)}")
                from .diagnostics.logging import log_error
                log_error(f"Progress worker error", exception=e)
        
        thread = threading.Thread(target=worker, daemon=True)
        thread.start()
        return thread


# Global performance monitor instance
performance_monitor = PerformanceMonitor()
async_worker = AsyncWorker()